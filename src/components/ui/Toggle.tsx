export function Toggle({ on, onToggle }: { on: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle} 
      className={`w-11 h-6 rounded-full relative cursor-pointer border-none transition-colors duration-300 ${on ? 'bg-forest' : 'bg-[#c1c8c2]'}`}
    >
      <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all duration-300 shadow-[0_1px_4px_rgba(0,0,0,0.2)] ${on ? 'left-[23px]' : 'left-[3px]'}`}></div>
    </button>
  );
}
