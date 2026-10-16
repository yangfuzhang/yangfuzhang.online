import { motion } from "framer-motion";
import { Bits, Hex } from "./bits";
import { busTransfer, type Machine, type PartId } from "./machine";

const NODES: { id: PartId; label: string }[] = [
  { id: "pc", label: "PC" },
  { id: "mar", label: "MAR" },
  { id: "ram", label: "RAM" },
  { id: "ir", label: "IR" },
  { id: "a", label: "A" },
  { id: "alu", label: "ALU" },
  { id: "b", label: "B" },
  { id: "out", label: "OUT" },
];

function nodeValue(id: PartId, cpu: Machine, aluValue: number) {
  switch (id) {
    case "pc":
      return `0x${cpu.pc.toString(16).toUpperCase()}`;
    case "mar":
      return `0x${cpu.mar.toString(16).toUpperCase()}`;
    case "ram":
      return cpu.ram[cpu.mar].toString(16).toUpperCase().padStart(2, "0");
    case "ir":
      return cpu.ir.toString(16).toUpperCase().padStart(2, "0");
    case "a":
      return String(cpu.a);
    case "alu":
      return String(aluValue);
    case "b":
      return String(cpu.b);
    case "out":
      return String(cpu.out);
    default:
      return "";
  }
}

export function Dataflow({
  cpu,
  ctrl,
  bus,
  aluValue,
}: {
  cpu: Machine;
  ctrl: number;
  bus: number;
  aluValue: number;
}) {
  const flow = busTransfer(ctrl);
  const from = flow.driver ? NODES.findIndex((node) => node.id === flow.driver?.id) : -1;
  const to = flow.sinks[0] ? NODES.findIndex((node) => node.id === flow.sinks[0]?.id) : -1;
  const sentence = flow.driver
    ? `${flow.driver.label} → 总线 → ${flow.sinks.map((sink) => sink.label).join("、") || "（无人接收）"}`
    : flow.extras.length
      ? flow.extras.join(" · ")
      : "总线空闲，这一拍没有数据在走";

  return (
    <section className="border-[3px] border-ink bg-cream">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink bg-ink px-3 py-2">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-lime">数据通路 · T{cpu.t}</p>
        <p className="font-poster text-lg text-cream">{sentence}</p>
        {flow.extras.length > 0 && (
          <p className="font-mono text-[11px] text-lime">{flow.extras.join(" · ")}</p>
        )}
      </div>

      <div className="overflow-x-auto px-2 py-3 md:px-4">
        <div className="min-w-[640px]">
        <div className="grid grid-cols-8 gap-1">
          {NODES.map((node, index) => {
            const drive = flow.driver?.id === node.id;
            const latch = flow.sinks.some((sink) => sink.id === node.id);
            return (
              <div
                key={node.id}
                className={`border-[3px] border-ink px-1 py-2 text-center ${
                  drive ? "bg-lime" : latch ? "bg-vermillion text-cream" : "bg-paper"
                }`}
                style={{ gridColumn: index + 1 }}
              >
                <p className="font-poster text-sm leading-none">{node.label}</p>
                <p className="mt-1 font-mono text-[10px] leading-none">{nodeValue(node.id, cpu, aluValue)}</p>
                <p className="mt-1 font-mono text-[9px] tracking-widest uppercase">
                  {drive ? "送出" : latch ? "锁存" : "—"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative mt-1 h-10">
          {NODES.map((node, index) => {
            const live =
              flow.driver?.id === node.id || flow.sinks.some((sink) => sink.id === node.id);
            return (
              <div key={node.id} className="absolute top-0 flex h-4 w-[12.5%] justify-center" style={{ left: `${index * 12.5}%` }}>
                <div className={`h-full w-[3px] ${live ? "bg-vermillion" : "bg-ink/30"}`} />
              </div>
            );
          })}
          <div className="absolute top-4 right-0 left-0 h-[6px] bg-ink" />
          {from >= 0 && (
            <motion.div
              key={`${cpu.t}-${from}-${to}-${cpu.pc}-${cpu.ir}`}
              className="absolute top-2 h-5 min-w-10 border-[3px] border-ink bg-lime px-1 text-center font-mono text-[10px] leading-4"
              initial={{ left: `calc(${from * 12.5}% + 1%)` }}
              animate={{
                left: to >= 0 ? [`calc(${from * 12.5}% + 1%)`, `calc(${to * 12.5}% + 1%)`] : `calc(${from * 12.5}% + 1%)`,
              }}
              transition={{ duration: 0.9, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
            >
              {bus.toString(16).toUpperCase().padStart(2, "0")}
            </motion.div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-[3px] border-ink bg-ink px-3 py-2">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-lime">BUS</p>
          <Bits value={bus} />
          <span className="font-mono text-sm text-lime">
            {flow.driver ? `${flow.driver.line} 驱动` : "Hi-Z"} · <Hex value={bus} />
          </span>
        </div>
        </div>
      </div>
    </section>
  );
}
