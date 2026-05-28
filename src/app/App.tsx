import { useCallback, useState } from "react";
import { DemoSetupScreen } from "./components/DemoSetupScreen";
import { DemoTabBar, type DemoTab } from "./components/DemoTabBar";
import { Demo1 } from "./components/Demo1";
import { Demo2 } from "./components/Demo2";
import { Demo3 } from "./components/Demo3";
import { DEFAULT_DEMO_CONFIG, type DemoConfig } from "./types/demoConfig";

type AppPhase = "setup" | "demo";

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("setup");
  // Captured but not yet piped into individual demos — the setup screen serves
  // primarily as the discovery landing for now.
  const [, setDemoConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [tab, setTab] = useState<DemoTab>("demo1");

  const handleLaunchDemo = useCallback((config: DemoConfig) => {
    setDemoConfig(config);
    setPhase("demo");
  }, []);

  if (phase === "setup") {
    return (
      <div className="size-full overflow-auto">
        <DemoSetupScreen onLaunch={handleLaunchDemo} />
      </div>
    );
  }

  return (
    <div className="size-full relative">
      {tab === "demo1" && <Demo1 />}
      {tab === "demo2" && <Demo2 />}
      {tab === "demo3" && <Demo3 />}
      <DemoTabBar active={tab} onChange={setTab} />
    </div>
  );
}
