export function regExpOr(regs: RegExp[], options?: string | undefined): RegExp {
  return new RegExp(
    regs
      .map(function (reg: RegExp) {
        return reg.source;
      })
      .join("|"),
    options
  );
}
