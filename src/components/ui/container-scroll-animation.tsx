import React from "react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative flex items-center justify-center p-2 md:p-10">
      <div className="relative w-full py-6 md:py-10">
        <div className="mx-auto max-w-5xl text-center">{titleComponent}</div>
        <div className="mx-auto mt-4 h-auto w-full max-w-6xl rounded-[30px] border border-[#C8A45D]/50 bg-gradient-to-b from-[#faf8f3] to-[#f2ece0] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] md:p-4">
          <div className="h-full w-full overflow-hidden rounded-2xl bg-transparent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
