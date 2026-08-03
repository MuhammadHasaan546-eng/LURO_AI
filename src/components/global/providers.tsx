"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "@/store";

interface Props {
  children: ReactNode;
}

const Providers = ({ children }: Props) => {
  const [store] = useState<AppStore>(makeStore);
  return <Provider store={store}>{children}</Provider>;
};

export default Providers;
