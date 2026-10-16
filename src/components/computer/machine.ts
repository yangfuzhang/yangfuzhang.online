/** Ben Eater-style SAP-1: 8-bit bus, 4-bit address, microcoded T1–T6. */

export const CTRL = {
  HLT: 1 << 0,
  MI: 1 << 1,
  RI: 1 << 2,
  RO: 1 << 3,
  IO: 1 << 4,
  II: 1 << 5,
  AI: 1 << 6,
  AO: 1 << 7,
  EO: 1 << 8,
  SU: 1 << 9,
  BI: 1 << 10,
  OI: 1 << 11,
  CE: 1 << 12,
  CO: 1 << 13,
  J: 1 << 14,
  FI: 1 << 15,
} as const;

export type PartId = "bus" | "pc" | "a" | "alu" | "b" | "mar" | "ram" | "ir" | "out" | "ctrl";

export const BUS_DRIVERS: { bit: number; line: string; id: PartId; label: string }[] = [
  { bit: CTRL.CO, line: "CO", id: "pc", label: "PC" },
  { bit: CTRL.AO, line: "AO", id: "a", label: "A" },
  { bit: CTRL.EO, line: "EO", id: "alu", label: "ALU" },
  { bit: CTRL.RO, line: "RO", id: "ram", label: "RAM" },
  { bit: CTRL.IO, line: "IO", id: "ir", label: "IR 低4位" },
];

export const BUS_SINKS: { bit: number; line: string; id: PartId; label: string }[] = [
  { bit: CTRL.MI, line: "MI", id: "mar", label: "MAR" },
  { bit: CTRL.RI, line: "RI", id: "ram", label: "RAM" },
  { bit: CTRL.II, line: "II", id: "ir", label: "IR" },
  { bit: CTRL.AI, line: "AI", id: "a", label: "A" },
  { bit: CTRL.BI, line: "BI", id: "b", label: "B" },
  { bit: CTRL.OI, line: "OI", id: "out", label: "OUT" },
  { bit: CTRL.J, line: "J", id: "pc", label: "PC" },
];

export function busTransfer(ctrl: number) {
  const driver = BUS_DRIVERS.find((item) => ctrl & item.bit) ?? null;
  const sinks = BUS_SINKS.filter((item) => ctrl & item.bit);
  const extras: string[] = [];
  if (ctrl & CTRL.CE) extras.push("PC + 1");
  if (ctrl & CTRL.FI) extras.push("锁存 CY / Z");
  if (ctrl & CTRL.SU) extras.push("ALU 做减法");
  if (ctrl & CTRL.HLT) extras.push("HLT 停钟");
  return { driver, sinks, extras };
}

export function moduleLane(id: PartId, ctrl: number): "drive" | "latch" | undefined {
  const flow = busTransfer(ctrl);
  if (flow.driver?.id === id) return "drive";
  if (flow.sinks.some((sink) => sink.id === id)) return "latch";
}

export const CONTROL_LINES: { bit: number; id: string }[] = [
  { bit: CTRL.HLT, id: "HLT" },
  { bit: CTRL.MI, id: "MI" },
  { bit: CTRL.RI, id: "RI" },
  { bit: CTRL.RO, id: "RO" },
  { bit: CTRL.IO, id: "IO" },
  { bit: CTRL.II, id: "II" },
  { bit: CTRL.AI, id: "AI" },
  { bit: CTRL.AO, id: "AO" },
  { bit: CTRL.EO, id: "EO" },
  { bit: CTRL.SU, id: "SU" },
  { bit: CTRL.BI, id: "BI" },
  { bit: CTRL.OI, id: "OI" },
  { bit: CTRL.CE, id: "CE" },
  { bit: CTRL.CO, id: "CO" },
  { bit: CTRL.J, id: "J" },
  { bit: CTRL.FI, id: "FI" },
];

export type Machine = {
  ram: number[];
  pc: number;
  a: number;
  b: number;
  ir: number;
  mar: number;
  out: number;
  cy: boolean;
  z: boolean;
  t: number;
  halted: boolean;
  bus: number;
  ctrl: number;
};

export const OPCODES: Record<number, string> = {
  0x0: "NOP",
  0x1: "LDA",
  0x2: "ADD",
  0x3: "SUB",
  0x4: "STA",
  0x5: "LDI",
  0x6: "JMP",
  0x7: "JC",
  0x8: "JZ",
  0xe: "OUT",
  0xf: "HLT",
};

const WITH_ADDR = new Set([0x1, 0x2, 0x3, 0x4, 0x6, 0x7, 0x8]);

export function decode(byte: number) {
  const op = (byte >> 4) & 0xf;
  const arg = byte & 0xf;
  const name = OPCODES[op] ?? "???";
  if (WITH_ADDR.has(op)) return `${name} ${arg.toString(16).toUpperCase()}`;
  if (op === 0x5) return `${name} ${arg}`;
  return name;
}

export function nibbleBits(byte: number) {
  const hi = ((byte >> 4) & 0xf).toString(2).padStart(4, "0");
  const lo = (byte & 0xf).toString(2).padStart(4, "0");
  return `${hi} ${lo}`;
}

export function currentInstruction(cpu: Machine) {
  if (cpu.t === 1) {
    const addr = cpu.pc & 0xf;
    const byte = cpu.ram[addr] & 0xff;
    return { phase: "取指" as const, addr, byte, text: decode(byte), from: "RAM" as const };
  }
  if (cpu.t === 2) {
    const addr = cpu.mar & 0xf;
    const byte = cpu.ram[addr] & 0xff;
    return { phase: "取指" as const, addr, byte, text: decode(byte), from: "RAM" as const };
  }
  return {
    phase: cpu.halted ? ("停机" as const) : cpu.t === 3 ? ("译码" as const) : ("执行" as const),
    addr: null as number | null,
    byte: cpu.ir & 0xff,
    text: decode(cpu.ir),
    from: "IR" as const,
  };
}

export function microcode(ir: number, t: number, cy: boolean, z: boolean) {
  if (t === 1) return CTRL.CO | CTRL.MI;
  if (t === 2) return CTRL.RO | CTRL.II | CTRL.CE;
  if (t === 3) return 0;

  const op = (ir >> 4) & 0xf;
  switch (op) {
    case 0x1:
      if (t === 4) return CTRL.IO | CTRL.MI;
      if (t === 5) return CTRL.RO | CTRL.AI;
      return 0;
    case 0x2:
      if (t === 4) return CTRL.IO | CTRL.MI;
      if (t === 5) return CTRL.RO | CTRL.BI;
      if (t === 6) return CTRL.EO | CTRL.AI | CTRL.FI;
      return 0;
    case 0x3:
      if (t === 4) return CTRL.IO | CTRL.MI;
      if (t === 5) return CTRL.RO | CTRL.BI;
      if (t === 6) return CTRL.EO | CTRL.SU | CTRL.AI | CTRL.FI;
      return 0;
    case 0x4:
      if (t === 4) return CTRL.IO | CTRL.MI;
      if (t === 5) return CTRL.AO | CTRL.RI;
      return 0;
    case 0x5:
      if (t === 4) return CTRL.IO | CTRL.AI;
      return 0;
    case 0x6:
      if (t === 4) return CTRL.IO | CTRL.J;
      return 0;
    case 0x7:
      if (t === 4 && cy) return CTRL.IO | CTRL.J;
      return 0;
    case 0x8:
      if (t === 4 && z) return CTRL.IO | CTRL.J;
      return 0;
    case 0xe:
      if (t === 4) return CTRL.AO | CTRL.OI;
      return 0;
    case 0xf:
      if (t === 4) return CTRL.HLT;
      return 0;
    default:
      return 0;
  }
}

export function alu(a: number, b: number, subtract: boolean) {
  const raw = subtract ? a - b : a + b;
  const value = raw & 0xff;
  const cy = subtract ? a >= b : raw > 255;
  return { value, cy, z: value === 0 };
}

export type AdderBit = {
  i: number;
  a: number;
  b: number;
  bIn: number;
  cin: number;
  sum: number;
  cout: number;
};

export function adderSlices(a: number, b: number, subtract: boolean): AdderBit[] {
  const slices: AdderBit[] = [];
  let cin = subtract ? 1 : 0;
  for (let i = 0; i < 8; i += 1) {
    const ai = (a >> i) & 1;
    const bi = (b >> i) & 1;
    const bIn = subtract ? 1 - bi : bi;
    const sum = ai ^ bIn ^ cin;
    const cout = (ai & bIn) | (ai & cin) | (bIn & cin);
    slices.push({ i, a: ai, b: bi, bIn, cin, sum, cout });
    cin = cout;
  }
  return slices;
}

export function focusFromCtrl(ctrl: number): PartId {
  if (ctrl & CTRL.HLT) return "ctrl";
  if (ctrl & (CTRL.EO | CTRL.SU | CTRL.FI)) return "alu";
  if (ctrl & CTRL.AI) return "a";
  if (ctrl & CTRL.BI) return "b";
  if (ctrl & CTRL.OI) return "out";
  if (ctrl & CTRL.II) return "ir";
  if (ctrl & (CTRL.RO | CTRL.RI)) return "ram";
  if (ctrl & CTRL.MI) return "mar";
  if (ctrl & (CTRL.J | CTRL.CE | CTRL.CO)) return "pc";
  return "ctrl";
}

export function blankRam() {
  return Array.from({ length: 16 }, () => 0);
}

export function boot(ram = blankRam()): Machine {
  return {
    ram,
    pc: 0,
    a: 0,
    b: 0,
    ir: 0,
    mar: 0,
    out: 0,
    cy: false,
    z: false,
    t: 1,
    halted: false,
    bus: 0,
    ctrl: 0,
  };
}

export function resetCpu(machine: Machine): Machine {
  return boot([...machine.ram]);
}

export function poke(machine: Machine, addr: number, value: number): Machine {
  const ram = [...machine.ram];
  ram[addr & 0xf] = value & 0xff;
  return { ...machine, ram };
}

export function driveBus(machine: Machine, ctrl: number) {
  const subtract = (ctrl & CTRL.SU) !== 0;
  const sum = alu(machine.a, machine.b, subtract);
  let bus = 0;
  if (ctrl & CTRL.CO) bus = machine.pc & 0xf;
  if (ctrl & CTRL.AO) bus = machine.a & 0xff;
  if (ctrl & CTRL.EO) bus = sum.value;
  if (ctrl & CTRL.RO) bus = machine.ram[machine.mar & 0xf] & 0xff;
  if (ctrl & CTRL.IO) bus = machine.ir & 0xf;
  return bus;
}

export function tick(machine: Machine): Machine {
  if (machine.halted) return machine;

  const ctrl = microcode(machine.ir, machine.t, machine.cy, machine.z);
  const subtract = (ctrl & CTRL.SU) !== 0;
  const sum = alu(machine.a, machine.b, subtract);
  const bus = driveBus(machine, ctrl);

  const next: Machine = {
    ...machine,
    ram: [...machine.ram],
    bus,
    ctrl,
  };

  if (ctrl & CTRL.MI) next.mar = bus & 0xf;
  if (ctrl & CTRL.RI) next.ram[next.mar & 0xf] = bus & 0xff;
  if (ctrl & CTRL.II) next.ir = bus & 0xff;
  if (ctrl & CTRL.AI) next.a = bus & 0xff;
  if (ctrl & CTRL.BI) next.b = bus & 0xff;
  if (ctrl & CTRL.OI) next.out = bus & 0xff;
  if (ctrl & CTRL.J) next.pc = bus & 0xf;
  else if (ctrl & CTRL.CE) next.pc = (machine.pc + 1) & 0xf;
  if (ctrl & CTRL.FI) {
    next.cy = sum.cy;
    next.z = sum.z;
  }
  if (ctrl & CTRL.HLT) {
    next.halted = true;
    return next;
  }

  next.t = machine.t === 6 ? 1 : machine.t + 1;
  return next;
}

export function runUntilHalt(machine: Machine, max = 256) {
  let current = machine;
  for (let i = 0; i < max && !current.halted; i += 1) {
    current = tick(current);
  }
  return current;
}

export type Program = {
  id: string;
  name: string;
  blurb: string;
  operands?: number[];
  bytes: number[];
};

function patch(pairs: Record<number, number>) {
  const ram = blankRam();
  for (const [addr, value] of Object.entries(pairs)) ram[Number(addr)] = value;
  return ram;
}

export const programs: Program[] = [
  {
    id: "add",
    name: "加法",
    blurb: "LDA E / ADD F / OUT / HLT。改 E、F 两个操作数再跑。",
    operands: [14, 15],
    bytes: patch({ 0: 0x1e, 1: 0x2f, 2: 0xe0, 3: 0xf0, 14: 3, 15: 5 }),
  },
  {
    id: "sub",
    name: "减法",
    blurb: "LDA E / SUB F / OUT / HLT。",
    operands: [14, 15],
    bytes: patch({ 0: 0x1e, 1: 0x3f, 2: 0xe0, 3: 0xf0, 14: 9, 15: 4 }),
  },
  {
    id: "ldi",
    name: "立即数",
    blurb: "LDI 7 / ADD F / OUT / HLT。LDI 只能装 0–15。",
    operands: [15],
    bytes: patch({ 0: 0x57, 1: 0x2f, 2: 0xe0, 3: 0xf0, 15: 1 }),
  },
  {
    id: "blank",
    name: "空白",
    blurb: "16 字节全 0。自己拨 DIP，按写入。",
    bytes: blankRam(),
  },
];

export function loadProgram(program: Program, x?: number, y?: number) {
  const ram = [...program.bytes];
  if (program.operands?.[0] != null && x != null) ram[program.operands[0]] = x & 0xff;
  if (program.operands?.[1] != null && y != null) ram[program.operands[1]] = y & 0xff;
  return boot(ram);
}
