import React from 'react';
import svgPaths from "./svg-u7cdpxat1d";
import { LogOut } from 'lucide-react';
import CredenColors from './CredenColors';

function Group() {
  return (
    <div className="absolute bottom-[15.31%] left-0 right-[42.08%] top-[14.4%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 105 28">
        <g id="Group">
          <path d={svgPaths.p3ad1a380} fill="var(--fill-0, #0767B1)" id="Vector" />
          <path d={svgPaths.p30259940} fill="var(--fill-0, #0767B1)" id="Vector_2" />
          <path d={svgPaths.p3a38500} fill="var(--fill-0, #0767B1)" id="Vector_3" />
          <path d={svgPaths.p1bf6c800} fill="var(--fill-0, #0767B1)" id="Vector_4" />
          <path d={svgPaths.p2e892500} fill="var(--fill-0, #0767B1)" id="Vector_5" />
          <path d={svgPaths.p3821b000} fill="var(--fill-0, #0767B1)" id="Vector_6" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute bottom-[15.28%] left-[59.11%] right-0 top-[14.29%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 74 28">
        <g id="Group">
          <path d={svgPaths.p161ce900} fill="var(--fill-0, #FABB05)" id="Vector" />
          <path d={svgPaths.p1f070800} fill="var(--fill-0, #FABB05)" id="Vector_2" />
          <path d={svgPaths.p1cf7e300} fill="var(--fill-0, #FABB05)" id="Vector_3" />
          <path d={svgPaths.p7e50d00} fill="var(--fill-0, #FABB05)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute bottom-[15.28%] contents left-0 right-0 top-[14.29%]" data-name="logo">
      <Group />
      <Group1 />
    </div>
  );
}

function LogoData() {
  return (
    <div className="h-[38.571px] relative shrink-0 w-[180px]" data-name="Logo Data">
      <Logo />
    </div>
  );
}

function NavbarBrand() {
  return (
    <div className="content-stretch flex h-[69px] items-center relative shrink-0 w-[280px]" data-name="Navbar Brand">
      <div className="scale-75 origin-left">
        <CredenColors />
      </div>
    </div>
  );
}

function Vector() {
  return (
    <div className="absolute bottom-0 left-0 right-[2%] top-0" data-name="Vector">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Vector">
          <path d={svgPaths.p35e37000} fill="var(--fill-0, #4285F4)" id="Vector_2" />
          <path d={svgPaths.p29347a00} fill="var(--fill-0, #34A853)" id="Vector_3" />
          <path d={svgPaths.p24794f00} fill="var(--fill-0, #FBBC05)" id="Vector_4" />
          <path d={svgPaths.p3243f8f0} fill="var(--fill-0, #EA4335)" id="Vector_5" />
        </g>
      </svg>
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Social Icons">
      <Vector />
    </div>
  );
}

function SocialLogin({ onClick, user, onLogout }: { onClick: () => void, user: any, onLogout: () => void }) {
  if (user) {
    return (
      <div className="bg-white h-[40px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-slate-50" onClick={onLogout} data-name="Social Login">
        <div className="box-border content-stretch flex gap-[8px] h-[40px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[inherit]">
           <LogOut className="w-4 h-4 text-slate-600" />
           <p className="font-['Anuphan:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[#2b2b2b] text-[16px] text-center text-nowrap whitespace-pre">
             Logout
           </p>
        </div>
        <div aria-hidden="true" className="absolute border border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[6px]" />
      </div>
    )
  }

  return (
    <div className="bg-white h-[40px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-slate-50" onClick={onClick} data-name="Social Login">
      <div className="box-border content-stretch flex gap-[8px] h-[40px] items-center justify-center overflow-clip px-4 py-2 relative rounded-[inherit]">
        <SocialIcons />
        <p className="font-sans font-medium leading-[22px] relative shrink-0 text-[#2b2b2b] text-sm text-center text-nowrap whitespace-pre">Login with Google</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function NavbarContent({ onLogin, user, onLogout }: { onLogin: () => void, user: any, onLogout: () => void }) {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[100px] shrink-0" data-name="Navbar Content">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center justify-between px-[24px] py-0 relative size-full">
          <NavbarBrand />
          <SocialLogin onClick={onLogin} user={user} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}

export default function NavbarLandingPage({ onLogin, user, onLogout }: { onLogin?: () => void, user?: any, onLogout?: () => void }) {
  return (
    <div className="bg-white relative size-full min-h-[80px]" data-name="Navbar landing page">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex items-center justify-center px-[0px] py-0 relative size-full max-w-[1200px]">
           {/* Adjusted padding to match dashboard width */}
          <NavbarContent onLogin={onLogin || (() => {})} user={user} onLogout={onLogout || (() => {})} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e6e6e6] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}
