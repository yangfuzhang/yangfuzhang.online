import { Bits, Hex, Led, SevenSeg, bitsOf } from "./bits";
import {
  CONTROL_LINES,
  CTRL,
  OPCODES,
  adderSlices,
  type Machine,
  type PartId,
} from "./machine";

const TITLES: Record<PartId, { tag: string; title: string; chip: string }> = {
  bus: { tag: "BUS", title: "8 位总线", chip: "排线" },
  pc: { tag: "PC", title: "程序计数器", chip: "74LS161" },
  a: { tag: "A", title: "A 寄存器", chip: "2×74LS173" },
  alu: { tag: "ALU", title: "行波进位加减器", chip: "2×74LS283" },
  b: { tag: "B", title: "B 寄存器", chip: "2×74LS173" },
  mar: { tag: "MAR", title: "存储器地址寄存器", chip: "74LS173" },
  ram: { tag: "RAM", title: "16×8 静态内存", chip: "74LS189" },
  ir: { tag: "IR", title: "指令寄存器", chip: "2×74LS173" },
  out: { tag: "OUT", title: "输出寄存器", chip: "74LS173 + EEPROM" },
  ctrl: { tag: "CTRL", title: "微码控制器", chip: "环计数器 + EEPROM" },
};

type Props = {
  part: PartId;
  cpu: Machine;
  ctrl: number;
  bus: number;
  live: boolean;
  onClose: () => void;
  onFollow?: () => void;
};

export function Cutaway({ part, cpu, ctrl, bus, live, onClose, onFollow }: Props) {
  const meta = TITLES[part];
  return (
    <section className="flex h-full flex-col border-[3px] border-ink bg-cream">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink bg-ink px-3 py-2">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-lime">
          剖开 · {meta.tag} · {meta.chip}
        </p>
        <p className="font-poster text-lg text-cream">{meta.title}</p>
        <div className="flex items-center gap-2">
          {live ? (
            <span className="border-[2px] border-lime bg-lime px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase text-ink">
              跟着这一拍
            </span>
          ) : (
            <button
              type="button"
              onClick={onFollow}
              className="border-[2px] border-lime px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase text-lime"
            >
              跟着这一拍
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="border-[2px] border-cream bg-vermillion px-2 py-0.5 font-poster text-sm text-cream"
          >
            收起
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-w-0 overflow-x-auto border-b-[3px] border-ink p-3">
          {part === "a" && (
            <RegisterGuts name="A" value={cpu.a} bus={bus} load={!!(ctrl & CTRL.AI)} enable={!!(ctrl & CTRL.AO)} />
          )}
          {part === "b" && (
            <RegisterGuts name="B" value={cpu.b} bus={bus} load={!!(ctrl & CTRL.BI)} enable={false} />
          )}
          {part === "mar" && (
            <RegisterGuts
              name="MAR"
              value={cpu.mar}
              bus={bus}
              width={4}
              load={!!(ctrl & CTRL.MI)}
              enable={false}
            />
          )}
          {part === "ir" && <IrGuts ir={cpu.ir} bus={bus} load={!!(ctrl & CTRL.II)} enable={!!(ctrl & CTRL.IO)} />}
          {part === "out" && <OutGuts value={cpu.out} bus={bus} load={!!(ctrl & CTRL.OI)} />}
          {part === "pc" && (
            <PcGuts
              pc={cpu.pc}
              bus={bus}
              count={!!(ctrl & CTRL.CE)}
              load={!!(ctrl & CTRL.J)}
              enable={!!(ctrl & CTRL.CO)}
            />
          )}
          {part === "alu" && <AluGuts a={cpu.a} b={cpu.b} subtract={!!(ctrl & CTRL.SU)} enable={!!(ctrl & CTRL.EO)} flagsIn={!!(ctrl & CTRL.FI)} cy={cpu.cy} z={cpu.z} />}
          {part === "ram" && (
            <RamGuts
              ram={cpu.ram}
              mar={cpu.mar}
              bus={bus}
              read={!!(ctrl & CTRL.RO)}
              write={!!(ctrl & CTRL.RI)}
            />
          )}
          {part === "ctrl" && <CtrlGuts ir={cpu.ir} t={cpu.t} ctrl={ctrl} halted={cpu.halted} cy={cpu.cy} z={cpu.z} />}
          {part === "bus" && <BusGuts bus={bus} ctrl={ctrl} />}
        </div>
        <div className="p-3">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground">这一拍在干什么</p>
          <p className="mt-2 text-sm leading-relaxed">{caption(part, ctrl)}</p>
          <ul className="mt-3 space-y-1 font-mono text-xs leading-relaxed">
            {legend(part).map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function caption(part: PartId, ctrl: number) {
  if (part === "a" && ctrl & CTRL.AI) return "时钟沿到来时，8 个 D 触发器同时把总线上的比特锁进 Q。这就是 AI。";
  if (part === "a" && ctrl & CTRL.AO) return "三态门打开，A 的 Q 接到总线。别的模块现在读到的就是 A。";
  if (part === "a") return "每位一个 D 触发器。没 AI 就保持；没 AO 就跟总线断开。";
  if (part === "b" && ctrl & CTRL.BI) return "B 从总线装数。加法前一步通常把内存里的操作数装进 B。";
  if (part === "b") return "B 只有输入，没有 BO。它只喂给 ALU。";
  if (part === "mar" && ctrl & CTRL.MI) return "MAR 锁存总线低 4 位。接下来 RAM 只看这个地址。";
  if (part === "mar") return "4 个触发器记住“现在要访问哪一格”。";
  if (part === "ir" && ctrl & CTRL.II) return "整条指令从 RAM 经总线写入 IR。高 4 位是操作码，低 4 位是地址/立即数。";
  if (part === "ir" && ctrl & CTRL.IO) return "IO 只把低 4 位放到总线上，送给 MAR 或 PC。操作码不出总线。";
  if (part === "ir") return "IR 切开：左边操作码去控制 EEPROM，右边操作数等 IO。";
  if (part === "out" && ctrl & CTRL.OI) return "OUT 锁存总线。后面的 EEPROM 把二进制译成七段笔画。";
  if (part === "out") return "显示的不是 ALU 即时结果，而是上次 OUT 指令锁进去的值。";
  if (part === "pc" && ctrl & CTRL.J) return "J 把总线低 4 位并行载入计数器，这就是 JMP。";
  if (part === "pc" && ctrl & CTRL.CE) return "CE 让计数器 +1。取指的 T2 总是带着这一拍，所以 PC 指向下一条。";
  if (part === "pc" && ctrl & CTRL.CO) return "CO 打开三态门，PC 出现在总线上，通常同时 MI 把它写入 MAR。";
  if (part === "pc") return "4 位二进制计数器。加一、跳转、或输出到总线。";
  if (part === "alu" && ctrl & CTRL.SU) return "SU 把 B 取反，进位入口接 1，等于做二进制补码减法。进位链从右往左爬。";
  if (part === "alu" && ctrl & CTRL.EO) return "EO 把 8 个全加器的和放到总线。AI 同时为真时，和被锁进 A。";
  if (part === "alu") return "两个 4 位超前进位芯片串成 8 位。不管有没有 EO，加法器每时每刻都在算 A±B。";
  if (part === "ram" && ctrl & CTRL.RO) return "译码器选中 MAR 那一行，RO 把 8 个存储单元接到总线。";
  if (part === "ram" && ctrl & CTRL.RI) return "同一行字线有效，RI 把总线写进这 8 个锁存器。";
  if (part === "ram") return "4-16 译码器只点亮一行。没选中的格子保持原值。";
  if (part === "ctrl") return "环计数器走 T1–T6。操作码 + T + 标志位去查 EEPROM，输出 16 根控制线。";
  if (part === "bus") return "同一时刻只该有一个模块在驱动。灯亮的那根线就是当前比特。";
  return "";
}

function legend(part: PartId) {
  const map: Record<PartId, string[]> = {
    a: ["黄灯 Q = 已存储", "D 来自总线", "LOAD 亮才会在时钟沿改 Q"],
    b: ["结构与 A 相同", "没有输出使能"],
    mar: ["只有低 4 位", "输出直接连 RAM 译码器"],
    ir: ["左 4 位 = 操作码", "右 4 位 = 操作数", "IO 只放操作数"],
    out: ["锁存后不再跟 ALU", "EEPROM 做二进制→十进制笔画"],
    pc: ["CE = +1", "J = 并行置数", "CO = 输出到总线"],
    alu: ["右 = 最低位", "Cout 接到下一位 Cin", "SU 时 B 变成 B'"],
    ram: ["红行 = MAR 选中", "每格 8 个锁存器"],
    ctrl: ["T1–T2 取指对所有指令相同", "T4–T6 查表执行"],
    bus: ["CO/AO/EO/RO/IO 是驱动源", "冲突时后写覆盖（硬件上会打架）"],
  };
  return map[part];
}

function RegisterGuts({
  name,
  value,
  bus,
  width = 8,
  load,
  enable,
}: {
  name: string;
  value: number;
  bus: number;
  width?: number;
  load: boolean;
  enable: boolean;
}) {
  const stored = bitsOf(value, width);
  const incoming = bitsOf(bus, width);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 font-mono text-[10px]">
        <Flag on={load} label="LOAD / CLK" />
        <Flag on={enable} label="三态输出" />
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
        {stored.map((bit, index) => {
          const d = incoming[index];
          return (
            <div key={index} className="border-[2px] border-ink bg-paper p-1 text-center font-mono text-[10px]">
              <p className="text-muted-foreground">D {d}</p>
              <div className={`mx-auto my-1 grid h-9 w-9 place-items-center border-[2px] border-ink ${bit ? "bg-lime" : "bg-ink text-lime"}`}>
                Q {bit}
              </div>
              <p className={enable ? "bg-vermillion text-cream" : "text-muted-foreground"}>
                {enable ? "→BUS" : "Hi-Z"}
              </p>
              {load && d !== bit && <p className="text-vermillion">将改</p>}
            </div>
          );
        })}
      </div>
      <p className="font-mono text-xs">
        {name} = <Hex value={value} width={width === 4 ? 1 : 2} /> · 总线 <Hex value={bus} />
      </p>
    </div>
  );
}

function IrGuts({ ir, bus, load, enable }: { ir: number; bus: number; load: boolean; enable: boolean }) {
  const op = (ir >> 4) & 0xf;
  const arg = ir & 0xf;
  return (
    <div className="flex flex-col gap-3">
      <RegisterGuts name="IR" value={ir} bus={bus} load={load} enable={false} />
      <div className="grid grid-cols-2 gap-2">
        <div className="border-[3px] border-ink bg-ink p-2 text-lime">
          <p className="font-mono text-[10px]">高半字节 → 控制 ROM</p>
          <p className="font-poster text-2xl">{OPCODES[op] ?? "???"}</p>
          <Bits value={op} width={4} />
        </div>
        <div className={`border-[3px] border-ink p-2 ${enable ? "bg-lime" : "bg-paper"}`}>
          <p className="font-mono text-[10px]">低半字节 {enable ? "IO 上总线" : "待命"}</p>
          <p className="font-poster text-2xl">{arg.toString(16).toUpperCase()}</p>
          <Bits value={arg} width={4} />
        </div>
      </div>
    </div>
  );
}

function OutGuts({ value, bus, load }: { value: number; bus: number; load: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <RegisterGuts name="OUT" value={value} bus={bus} load={load} enable={false} />
      </div>
      <div className="border-[3px] border-ink bg-ink p-2">
        <p className="mb-1 font-mono text-[10px] text-lime">译码 EEPROM → 七段</p>
        <SevenSeg value={value} />
      </div>
    </div>
  );
}

function PcGuts({
  pc,
  bus,
  count,
  load,
  enable,
}: {
  pc: number;
  bus: number;
  count: boolean;
  load: boolean;
  enable: boolean;
}) {
  const bits = bitsOf(pc, 4);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 font-mono text-[10px]">
        <Flag on={count} label="CE +1" />
        <Flag on={load} label="J 置数" />
        <Flag on={enable} label="CO 输出" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {bits.map((bit, index) => (
          <div key={index} className="border-[3px] border-ink bg-paper p-2 text-center">
            <p className="font-mono text-[10px]">bit {3 - index}</p>
            <div className={`mx-auto my-1 grid h-10 w-10 place-items-center border-[3px] border-ink font-poster text-xl ${bit ? "bg-lime" : "bg-cream"}`}>
              {bit}
            </div>
            {count && <p className="font-mono text-[10px] text-vermillion">将翻转/进位</p>}
          </div>
        ))}
      </div>
      <p className="font-mono text-xs">
        下一拍 PC → {load ? (bus & 0xf).toString(16).toUpperCase() : count ? ((pc + 1) & 0xf).toString(16).toUpperCase() : pc.toString(16).toUpperCase()}
      </p>
    </div>
  );
}

function AluGuts({
  a,
  b,
  subtract,
  enable,
  flagsIn,
  cy,
  z,
}: {
  a: number;
  b: number;
  subtract: boolean;
  enable: boolean;
  flagsIn: boolean;
  cy: boolean;
  z: boolean;
}) {
  const slices = adderSlices(a, b, subtract).slice().reverse();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 font-mono text-[10px]">
        <Flag on={subtract} label="SU  B→B'" />
        <Flag on={enable} label="EO  和→总线" />
        <Flag on={flagsIn} label="FI  锁存标志" />
        <Flag on={cy} label="CY" tone="red" />
        <Flag on={z} label="Z" />
      </div>
      <div className="grid grid-cols-8 gap-1">
        {slices.map((slice) => (
          <div key={slice.i} className="border-[2px] border-ink bg-paper p-1 text-center font-mono text-[10px] leading-tight">
            <p className="text-muted-foreground">b{slice.i}</p>
            <p>A {slice.a}</p>
            <p>{subtract ? "B'" : "B"} {slice.bIn}</p>
            <p className={slice.cin ? "bg-vermillion text-cream" : ""}>Cin {slice.cin}</p>
            <div className={`my-1 border-[2px] border-ink ${slice.sum ? "bg-lime" : "bg-cream"}`}>Σ {slice.sum}</div>
            <p className={slice.cout ? "bg-vermillion text-cream" : ""}>Cout {slice.cout}</p>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs">{subtract ? "A − B" : "A + B"} = {slices.reduce((n, s) => n + (s.sum << s.i), 0)} {enable ? "· 正在上总线" : "· 还没输出"}</p>
    </div>
  );
}

function RamGuts({
  ram,
  mar,
  bus,
  read,
  write,
}: {
  ram: number[];
  mar: number;
  bus: number;
  read: boolean;
  write: boolean;
}) {
  const decode = bitsOf(1 << (15 - mar), 16);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 font-mono text-[10px]">
        <Flag on={read} label="RO 读出" />
        <Flag on={write} label="RI 写入" />
        <span>MAR {mar.toString(16).toUpperCase()}</span>
      </div>
      <p className="font-mono text-[10px]">4→16 译码 · 字线</p>
      <div className="flex gap-0.5">
        {decode.map((on, index) => (
          <div
            key={index}
            className={`h-3 flex-1 border border-ink ${on ? "bg-vermillion" : "bg-paper"}`}
            title={`word ${index}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {ram.map((cell, index) => {
          const on = index === mar;
          return (
            <div
              key={index}
              className={`border-[2px] border-ink p-1 font-mono text-[10px] ${on ? "bg-lime" : "bg-paper"}`}
            >
              <p>
                {index.toString(16).toUpperCase()} {cell.toString(16).toUpperCase().padStart(2, "0")}
              </p>
              <div className="mt-1 flex gap-px">
                {bitsOf(on && write ? bus : cell).map((bit, i) => (
                  <span key={i} className={`h-2 flex-1 ${bit ? "bg-ink" : "bg-cream"}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CtrlGuts({
  ir,
  t,
  ctrl,
  halted,
  cy,
  z,
}: {
  ir: number;
  t: number;
  ctrl: number;
  halted: boolean;
  cy: boolean;
  z: boolean;
}) {
  const op = (ir >> 4) & 0xf;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1 font-mono text-[10px]">环计数器</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`grid h-10 flex-1 place-items-center border-[3px] border-ink font-poster ${
                t === step ? "bg-vermillion text-cream" : "bg-paper"
              }`}
            >
              T{step}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Box label="操作码" value={`${OPCODES[op] ?? "???"} ${op.toString(16).toUpperCase()}`} />
        <Box label="T" value={`T${t}`} />
        <Box label="标志" value={`CY ${cy ? 1 : 0}  Z ${z ? 1 : 0}`} />
      </div>
      <p className="font-mono text-[10px]">EEPROM 输出 16 根控制线</p>
      <div className="grid grid-cols-8 gap-1">
        {CONTROL_LINES.map((line) => {
          const on = (ctrl & line.bit) !== 0;
          return (
            <div
              key={line.id}
              className={`border-[2px] border-ink px-1 py-1 text-center font-mono text-[9px] ${
                on ? (line.id === "HLT" ? "bg-vermillion text-cream" : "bg-lime") : "bg-paper"
              }`}
            >
              {line.id}
            </div>
          );
        })}
      </div>
      {halted && <p className="border-[3px] border-ink bg-vermillion px-2 py-1 font-poster text-cream">HLT 拉高，时钟停</p>}
    </div>
  );
}

function BusGuts({ bus, ctrl }: { bus: number; ctrl: number }) {
  const drivers = [
    { id: "CO", on: !!(ctrl & CTRL.CO), src: "PC" },
    { id: "AO", on: !!(ctrl & CTRL.AO), src: "A" },
    { id: "EO", on: !!(ctrl & CTRL.EO), src: "ALU" },
    { id: "RO", on: !!(ctrl & CTRL.RO), src: "RAM" },
    { id: "IO", on: !!(ctrl & CTRL.IO), src: "IR[3:0]" },
  ];
  const driver = drivers.find((item) => item.on);
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs">驱动源：{driver ? `${driver.src} (${driver.id})` : "无人驱动 / 悬浮"}</p>
      <div className="flex flex-col gap-1">
        {bitsOf(bus).map((bit, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-8 font-mono text-[10px]">b{7 - index}</span>
            <div className={`h-3 flex-1 border-[2px] border-ink ${bit ? "bg-lime" : "bg-ink"}`} />
            <Led on={bit === 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Flag({ on, label, tone = "lime" }: { on: boolean; label: string; tone?: "lime" | "red" }) {
  return (
    <span className="flex items-center gap-1">
      <Led on={on} tone={tone} />
      {label}
    </span>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[3px] border-ink bg-paper p-2">
      <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
      <p className="font-poster text-lg">{value}</p>
    </div>
  );
}
