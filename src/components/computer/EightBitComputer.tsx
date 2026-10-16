import { useEffect, useMemo, useState } from "react";
import { Cutaway } from "./Cutaway";
import { Dataflow } from "./Dataflow";
import { Bits, Dip, Hex, Led, Module, SevenSeg } from "./bits";
import {
  CONTROL_LINES,
  CTRL,
  alu,
  currentInstruction,
  decode,
  driveBus,
  nibbleBits,
  focusFromCtrl,
  loadProgram,
  microcode,
  moduleLane,
  poke,
  programs,
  resetCpu,
  tick,
  type Machine,
  type PartId,
  type Program,
} from "./machine";

const SPEEDS = [
  { hz: 1, label: "极慢" },
  { hz: 2, label: "慢" },
  { hz: 8, label: "中" },
  { hz: 20, label: "快" },
];

export function EightBitComputer() {
  const [program, setProgram] = useState<Program>(programs[0]);
  const [cpu, setCpu] = useState<Machine>(() => loadProgram(programs[0]));
  const [running, setRunning] = useState(false);
  const [hz, setHz] = useState(8);
  const [addr, setAddr] = useState(0);
  const [peek, setPeek] = useState<PartId | null>(null);
  const [open, setOpen] = useState(false);

  const ctrl = useMemo(
    () => (cpu.halted ? cpu.ctrl : microcode(cpu.ir, cpu.t, cpu.cy, cpu.z)),
    [cpu],
  );
  const bus = useMemo(() => driveBus(cpu, ctrl), [cpu, ctrl]);
  const sum = useMemo(
    () => alu(cpu.a, cpu.b, (ctrl & CTRL.SU) !== 0),
    [cpu.a, cpu.b, ctrl],
  );
  const livePart = focusFromCtrl(ctrl);
  const inspect = open ? (peek ?? livePart) : null;
  const inst = currentInstruction(cpu);

  const toggleInspect = (id: PartId) => {
    if (open && inspect === id) {
      setOpen(false);
      return;
    }
    setPeek(id);
    setOpen(true);
  };

  useEffect(() => {
    if (!running || cpu.halted) {
      if (cpu.halted) setRunning(false);
      return;
    }
    const id = window.setInterval(() => {
      setCpu((current) => tick(current));
    }, Math.max(50, 1000 / hz));
    return () => window.clearInterval(id);
  }, [running, hz, cpu.halted]);

  const load = (next: Program) => {
    setProgram(next);
    setCpu(loadProgram(next));
    setRunning(false);
    setAddr(0);
    setPeek(null);
    setOpen(false);
  };

  const pulse = () => {
    setRunning(false);
    setCpu((current) => tick(current));
  };

  const reset = () => {
    setRunning(false);
    setCpu((current) => resetCpu(current));
  };

  const writeRam = (at: number, value: number) => {
    setCpu((current) => poke(current, at, value));
  };

  const xAddr = program.operands?.[0];
  const yAddr = program.operands?.[1];

  return (
    <div className="flex flex-1 flex-col gap-5 pb-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-block border-[3px] border-ink bg-lime px-2 py-1 font-mono text-[11px] tracking-[0.28em] uppercase">
            SAP-1 / 8-bit
          </p>
          <h1 className="font-headline text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.95]">
            8-bit面包板电脑
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Ben Eater 那台。点模块上的「内部」剖开，再点一次或点「收起」关掉。
          </p>
        </div>
        <a
          href="/"
          className="self-start border-[3px] border-ink bg-cream px-4 py-2 font-poster brutal-shadow brutal-press"
        >
          返回首页
        </a>
      </header>

      <div className="flex flex-wrap gap-2">
        {programs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => load(item)}
            className={`border-[3px] border-ink px-4 py-2 font-poster brutal-shadow brutal-press ${
              item.id === program.id ? "bg-vermillion text-cream" : "bg-cream"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">{program.blurb}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={pulse}
          className="border-[3px] border-ink bg-lime px-4 py-2 font-poster brutal-shadow brutal-press"
        >
          脉冲
        </button>
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="border-[3px] border-ink bg-cream px-4 py-2 font-poster brutal-shadow brutal-press"
        >
          {running ? "暂停" : "运行"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="border-[3px] border-ink bg-cream px-4 py-2 font-poster brutal-shadow brutal-press"
        >
          复位
        </button>
        <div className="flex border-[3px] border-ink">
          {SPEEDS.map((item) => (
            <button
              key={item.hz}
              type="button"
              onClick={() => setHz(item.hz)}
              className={`px-3 py-2 font-mono text-xs ${hz === item.hz ? "bg-ink text-lime" : "bg-cream"}`}
            >
              {item.label} {item.hz}Hz
            </button>
          ))}
        </div>
        <span className="flex items-center gap-2 border-[3px] border-ink bg-ink px-3 py-2 font-mono text-xs text-lime">
          <Led on={cpu.halted} tone="red" />
          {cpu.halted ? "HALT" : running ? "RUN" : "STOP"}
          {" · "}T{cpu.t}
        </span>
      </div>

      <div className="flex flex-wrap items-stretch border-[3px] border-ink">
        <p className="flex items-center bg-ink px-3 py-2 font-mono text-[11px] tracking-[0.2em] uppercase text-lime">
          当前指令
        </p>
        <p
          className={`flex items-center px-3 py-2 font-poster ${
            inst.phase === "执行" ? "bg-vermillion text-cream" : inst.phase === "停机" ? "bg-ink text-lime" : "bg-cream"
          }`}
        >
          {inst.phase} T{cpu.t}
        </p>
        <p className="flex items-center bg-lime px-4 py-2 font-poster text-2xl leading-none">{inst.text}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-cream px-3 py-2 font-mono text-sm">
          <span>{nibbleBits(inst.byte)}</span>
          <Hex value={inst.byte} />
          <span>
            {inst.from}
            {inst.addr != null ? ` @${inst.addr.toString(16).toUpperCase()}` : ""}
          </span>
        </p>
      </div>

      <Dataflow cpu={cpu} ctrl={ctrl} bus={bus} aluValue={sum.value} />

      <div className={`grid gap-4 ${inspect ? "lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]" : ""}`}>
      <div className="border-[3px] border-ink bg-[#c5d4b8] p-2 md:p-3">
        <button
          type="button"
          onClick={() => toggleInspect("bus")}
          className={`mb-2 flex w-full items-center justify-between gap-3 border-[3px] border-ink px-3 py-2 ${
            inspect === "bus" ? "bg-vermillion text-cream" : "bg-ink text-lime"
          }`}
        >
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">BUS 8-bit · 内部</p>
          <Bits value={bus} />
          <Hex value={bus} />
        </button>

        <div className={`grid gap-2 md:grid-cols-2 ${inspect ? "" : "xl:grid-cols-4"}`}>
          <Module tag="CLK / PC" title="程序计数器" chip="74LS161" active={(ctrl & (CTRL.CO | CTRL.CE | CTRL.J)) !== 0} inspecting={inspect === "pc"} lane={moduleLane("pc", ctrl)} onInspect={() => toggleInspect("pc")}>
            <Bits value={cpu.pc} width={4} />
            <p className="font-mono text-xs">
              PC <Hex value={cpu.pc} width={1} />
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <span
                  key={step}
                  className={`grid h-7 w-7 place-items-center border-[2px] border-ink font-mono text-[10px] ${
                    cpu.t === step ? "bg-vermillion text-cream" : "bg-paper"
                  }`}
                >
                  T{step}
                </span>
              ))}
            </div>
          </Module>

          <Module tag="A" title="A 寄存器" chip="74LS173" active={(ctrl & (CTRL.AI | CTRL.AO)) !== 0} inspecting={inspect === "a"} lane={moduleLane("a", ctrl)} onInspect={() => toggleInspect("a")}>
            <Bits value={cpu.a} />
            <p className="font-mono text-xs">
              A <Hex value={cpu.a} /> · {cpu.a}
            </p>
          </Module>

          <Module tag="ALU" title="加减器" chip="74LS283" active={(ctrl & (CTRL.EO | CTRL.SU | CTRL.FI)) !== 0} inspecting={inspect === "alu"} lane={moduleLane("alu", ctrl)} onInspect={() => toggleInspect("alu")}>
            <p className="font-mono text-xs">
              {ctrl & CTRL.SU ? "A − B" : "A + B"} = {sum.value}
              <span className="block text-[10px] text-muted-foreground">组合器一直在算，结果进 A 才算数</span>
            </p>
            <Bits value={sum.value} />
            <div className="flex gap-3 font-mono text-xs">
              <span className="flex items-center gap-1">
                <Led on={cpu.cy} tone="red" /> CY
              </span>
              <span className="flex items-center gap-1">
                <Led on={cpu.z} /> Z
              </span>
            </div>
          </Module>

          <Module tag="B" title="B 寄存器" chip="74LS173" active={(ctrl & CTRL.BI) !== 0} inspecting={inspect === "b"} lane={moduleLane("b", ctrl)} onInspect={() => toggleInspect("b")}>
            <Bits value={cpu.b} />
            <p className="font-mono text-xs">
              B <Hex value={cpu.b} /> · {cpu.b}
            </p>
          </Module>

          <Module tag="MAR" title="地址寄存器" chip="74LS173" active={(ctrl & CTRL.MI) !== 0} inspecting={inspect === "mar"} lane={moduleLane("mar", ctrl)} onInspect={() => toggleInspect("mar")}>
            <Bits value={cpu.mar} width={4} />
            <p className="font-mono text-xs">
              MAR <Hex value={cpu.mar} width={1} />
            </p>
          </Module>

          <Module tag="RAM" title="16×8 内存" chip="74LS189" active={(ctrl & (CTRL.RO | CTRL.RI)) !== 0} inspecting={inspect === "ram"} lane={moduleLane("ram", ctrl)} onInspect={() => toggleInspect("ram")}>
            <div className="grid grid-cols-4 gap-1">
              {cpu.ram.map((cell, index) => {
                const isMar = cpu.mar === index;
                const isPc = cpu.pc === index;
                const isSel = addr === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAddr(index)}
                    className={`border-[2px] border-ink px-1 py-0.5 text-left font-mono text-[10px] leading-tight ${
                      isMar ? "bg-vermillion text-cream" : isPc ? "bg-lime" : isSel ? "bg-paper" : "bg-cream"
                    }`}
                    title={decode(cell)}
                  >
                    {index.toString(16).toUpperCase()} {cell.toString(16).toUpperCase().padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </Module>

          <Module tag="IR" title="指令寄存器" chip="74LS173" active={(ctrl & (CTRL.II | CTRL.IO)) !== 0} inspecting={inspect === "ir"} lane={moduleLane("ir", ctrl)} onInspect={() => toggleInspect("ir")}>
            <Bits value={cpu.ir} />
            <p className="font-mono text-xs">
              {decode(cpu.ir)} · <Hex value={cpu.ir} />
            </p>
          </Module>

          <Module tag="OUT" title="输出" chip="7-SEG" active={(ctrl & CTRL.OI) !== 0} inspecting={inspect === "out"} lane={moduleLane("out", ctrl)} onInspect={() => toggleInspect("out")}>
            <SevenSeg value={cpu.out} />
            <p className="font-mono text-xs text-center">
              OUT {cpu.out}
            </p>
          </Module>
        </div>

        <button
          type="button"
          onClick={() => toggleInspect("ctrl")}
          className={`mt-2 w-full border-[3px] border-ink p-2 text-left ${
            inspect === "ctrl" ? "bg-lime" : "bg-cream"
          }`}
        >
          <p className="mb-2 font-mono text-[10px] tracking-[0.2em] uppercase">控制字 · 微码 · 点这里看内部</p>
          <div className="flex flex-wrap gap-2">
            {CONTROL_LINES.map((line) => (
              <span key={line.id} className="flex flex-col items-center gap-1">
                <Led on={(ctrl & line.bit) !== 0} tone={line.id === "HLT" ? "red" : "lime"} />
                <span className="font-mono text-[9px]">{line.id}</span>
              </span>
            ))}
          </div>
        </button>
      </div>

      {inspect ? (
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <Cutaway
            part={inspect}
            cpu={cpu}
            ctrl={ctrl}
            bus={bus}
            live={peek == null}
            onClose={() => setOpen(false)}
            onFollow={() => setPeek(null)}
          />
        </div>
      ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border-[3px] border-ink bg-cream p-3">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">内存编程</p>
          <p className="mt-1 text-sm text-muted-foreground">
            选中格子，拨 DIP，立刻写入。红格是 MAR 正在指的地址，绿格是 PC。
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 font-mono text-xs">
              地址 {addr.toString(16).toUpperCase()}
              <Dip value={addr} width={4} onChange={(value) => setAddr(value & 0xf)} />
            </label>
            <label className="flex flex-col gap-1 font-mono text-xs">
              数据 {cpu.ram[addr].toString(16).toUpperCase().padStart(2, "0")} · {decode(cpu.ram[addr])}
              <Dip value={cpu.ram[addr]} onChange={(value) => writeRam(addr, value)} />
            </label>
          </div>

          {xAddr != null && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Operand
                label={`操作数 @${xAddr.toString(16).toUpperCase()}`}
                value={cpu.ram[xAddr]}
                onChange={(value) => writeRam(xAddr, value)}
              />
              {yAddr != null && (
                <Operand
                  label={`操作数 @${yAddr.toString(16).toUpperCase()}`}
                  value={cpu.ram[yAddr]}
                  onChange={(value) => writeRam(yAddr, value)}
                />
              )}
            </div>
          )}
        </section>

        <section className="border-[3px] border-ink bg-ink p-3 text-lime">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">指令表 · 高 4 位操作码</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs">
            <li>0001 LDA 地址</li>
            <li>0010 ADD 地址</li>
            <li>0011 SUB 地址</li>
            <li>0100 STA 地址</li>
            <li>0101 LDI 0–15</li>
            <li>0110 JMP 地址</li>
            <li>0111 JC 有进位跳</li>
            <li>1000 JZ 为零跳</li>
            <li>1110 OUT</li>
            <li>1111 HLT</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-lime/85">
            加法程序：地址 0–3 是 LDA E、ADD F、OUT、HLT。改 E=14、F=15 里的数，复位再运行，七段就会显示和。
          </p>
        </section>
      </div>
    </div>
  );
}

function Operand({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="border-[3px] border-ink bg-paper p-2">
      <div className="mb-2 flex items-center justify-between font-mono text-xs">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <Dip value={value} onChange={onChange} />
      <div className="mt-2 flex gap-1">
        <button
          type="button"
          className="border-[2px] border-ink bg-cream px-2 font-poster"
          onClick={() => onChange((value - 1) & 0xff)}
        >
          −
        </button>
        <button
          type="button"
          className="border-[2px] border-ink bg-cream px-2 font-poster"
          onClick={() => onChange((value + 1) & 0xff)}
        >
          +
        </button>
      </div>
    </div>
  );
}
