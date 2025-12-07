function Button() {
  return (
    <div className="bg-[#ebf6ff] h-[34px] relative rounded-[6px] shrink-0" data-name="Button">
      <div className="box-border content-stretch flex h-[34px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[inherit]">
        <p className="font-['Anuphan:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#0767b0] text-[16px] text-center text-nowrap whitespace-pre">งบปี</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#0767b0] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[34px] relative rounded-[6px] shrink-0" data-name="Button">
      <div className="box-border content-stretch flex h-[34px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[inherit]">
        <p className="font-['Anuphan:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#545454] text-[16px] text-center text-nowrap whitespace-pre">งบไตรมาส</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#bbbbbb] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[34px] relative rounded-[6px] shrink-0" data-name="Button">
      <div className="box-border content-stretch flex h-[34px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[inherit]">
        <p className="font-['Anuphan:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#545454] text-[16px] text-center text-nowrap whitespace-pre">งบไตรมาสสะสม</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#bbbbbb] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative size-full">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}