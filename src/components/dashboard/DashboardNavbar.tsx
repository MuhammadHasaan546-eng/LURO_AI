import { HelpCircleIcon, ZapIcon } from "lucide-react";
import { Span } from "next/dist/trace";
import Link from "next/link";
import React from "react";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import Container from "../global/container";

const DashboardNavbar = () => {
  return (
    <header
      id="dashboard-navbar"
      className="fixed top-0 inset-x-0 w-full h-16 bg-background/40 backdrop-blur-md  border-border/50 px-4 z-50"
    >
      <Container className="flex  items-center justify-between size-full ">
        <div className="flex item-center">
          <Link
            href="/app"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Icons.icon className="w-6" />
            <span className="text-lg font-semibold">Luro</span>
          </Link>
        </div>
        <div className="flex item-center gap-x-2">
          <Button size="sm" variant="ghost">
            <ZapIcon className="size-4 mr-1.5 text-orange-500 fill-orange-500 " />
            Upgrade
          </Button>

          <Button
            asChild
            size="icon"
            variant="ghost"
            className="hidden lg:flex"
          >
            <Link href="/help" target="_blank">
              <HelpCircleIcon className="size-5" />
            </Link>
          </Button>
          {"mobile side bar"}
        </div>
      </Container>
    </header>
  );
};

export default DashboardNavbar;
