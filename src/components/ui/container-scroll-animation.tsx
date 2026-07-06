import React, { useRef } from "react";
import {
  useScroll,
  useTransform,
  motion,
  type MotionValue,
} from "framer-motion";
import { useCompareStore } from "@/stores/compare-store";
import { useHydrated } from "@/hooks/use-hydrated";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);
  const hydrated = useHydrated();
  const { selected } = useCompareStore();
  // Freeze the scroll-driven animation once the user starts building a comparison
  // so the content stays readable while adding/removing properties.
  const freeze = hydrated && selected.length > 0;

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.95] : [1.08, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center p-2 md:p-10"
    >
      <div
        className="relative w-full py-6 md:py-10"
        style={freeze ? undefined : { perspective: "1000px" }}
      >
        {freeze ? (
          <div className="mx-auto max-w-5xl text-center">{titleComponent}</div>
        ) : (
          <ScrollHeader translate={translate} titleComponent={titleComponent} />
        )}
        {freeze ? (
          <div className="mx-auto mt-4 h-auto w-full max-w-6xl rounded-[30px] border border-black/10 bg-white p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] md:p-4">
            <div className="h-full w-full overflow-hidden rounded-2xl bg-transparent">
              {children}
            </div>
          </div>
        ) : (
          <ScrollCard rotate={rotate} scale={scale} translate={translate}>
            {children}
          </ScrollCard>
        )}
      </div>
    </div>
  );
};

export const ScrollHeader = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: React.ReactNode;
}) => (
  <motion.div style={{ translateY: translate }} className="mx-auto max-w-5xl text-center">
    {titleComponent}
  </motion.div>
);

export const ScrollCard = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,
      boxShadow:
        "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
    }}
    className="mx-auto -mt-6 h-auto w-full max-w-6xl rounded-[30px] border border-black/10 bg-white p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] md:p-4"
  >
    <div className="h-full w-full overflow-hidden rounded-2xl bg-transparent">{children}</div>
  </motion.div>
);
