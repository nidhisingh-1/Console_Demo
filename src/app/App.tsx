import { useState } from "react";
import { DemoTabBar, type DemoTab } from "./components/DemoTabBar";
import { Demo1 } from "./components/Demo1";
import { Demo2 } from "./components/Demo2";
import { Demo3 } from "./components/Demo3";

export default function App() {
  const [tab, setTab] = useState<DemoTab>("demo1");

  return (
    <div className="size-full relative">
      {tab === "demo1" && <Demo1 />}
      {tab === "demo2" && <Demo2 />}
      {tab === "demo3" && <Demo3 />}
      <DemoTabBar active={tab} onChange={setTab} />
    </div>
  );
}
