import mongoose from "mongoose";
import { env } from "@/lib/env";
import { applicationModels } from "@/models";

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConnection?: Promise<typeof mongoose>;
  mongooseIndexes?: Promise<void>;
  mongooseShutdownRegistered?: boolean;
};

mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);

const redactConnectionError = (error: unknown) => {
  const reason = error instanceof Error && error.name ? ` (${error.name})` : "";
  return new Error(`MongoDB connection failed${reason}.`);
};

const createConnection = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DATABASE,
      maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
      minPoolSize: env.MONGODB_MIN_POOL_SIZE,
      serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      autoIndex: env.NODE_ENV !== "production",
    });

    if (env.NODE_ENV === "production") {
      globalForMongoose.mongooseIndexes ??= Promise.all(
        applicationModels.map((model) => model.createIndexes()),
      ).then(() => undefined);
      await globalForMongoose.mongooseIndexes;
    }

    return connection;
  } catch (error) {
    globalForMongoose.mongooseConnection = undefined;
    throw redactConnectionError(error);
  }
};

export const connectToDatabase = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  globalForMongoose.mongooseConnection ??= createConnection();
  return globalForMongoose.mongooseConnection;
};

export const disconnectFromDatabase = async () => {
  globalForMongoose.mongooseConnection = undefined;
  globalForMongoose.mongooseIndexes = undefined;
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
};

const isStandaloneTransactionError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message : "";

  return (
    candidate.code === 20 ||
    /replica set|Transaction numbers/i.test(message)
  );
};

export const withMongoTransaction = async <T>(
  operation: (session: mongoose.ClientSession | null) => Promise<T>,
): Promise<T> => {
  await connectToDatabase();
  const session = await mongoose.startSession();

  try {
    let result: T | undefined;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    if (result === undefined) {
      throw new Error("MongoDB transaction completed without a result.");
    }
    return result;
  } catch (error) {
    if (!isStandaloneTransactionError(error)) throw error;

    // A standalone MongoDB server cannot start transactions. Abort only when
    // there is an active transaction; abortTransaction itself is not safe to
    // call unconditionally after withTransaction fails during setup.
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch {
        // Preserve the original standalone-server error and use the fallback.
      }
    }

    return operation(null);
  } finally {
    await session.endSession();
  }
};

if (!globalForMongoose.mongooseShutdownRegistered) {
  globalForMongoose.mongooseShutdownRegistered = true;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void disconnectFromDatabase().finally(() => process.exit(0));
    });
  }
}
