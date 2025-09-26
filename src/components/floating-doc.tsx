/* eslint-disable prefer-const */
import { cn } from "../lib";
import {
  IconLayoutNavbarCollapse,
  IconNotebook,
  IconCheckbox,
  IconLayoutBoard,
} from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useRef, useState } from "react";

// FloatingDoc wrapper (desktop + mobile)
export const FloatingDoc = ({
  desktopClassName,
  mobileClassName,
}: {
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  // Main items
  const items = [
    {
      title: "Notes",
      icon: <IconNotebook className="w-6 h-6" />,
      href: "/notes",
    },
    {
      title: "To-Do",
      icon: <IconCheckbox className="w-6 h-6" />,
      href: "/todo",
    },
    {
      title: "Scrum Board",
      icon: <IconLayoutBoard className="w-6 h-6" />,
      href: "/scrum",
    },
  ];

  return (
    <>
      <FloatingDocDesktop items={items} className={desktopClassName} />
      <FloatingDocMobile items={items} className={mobileClassName} />
    </>
  );
};

// ---------------- MOBILE ----------------
const FloatingDocMobile = ({
  items,
  className,
}: {
  className?: string;
  items: { title: string; href: string; icon: React.ReactNode }[];
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.2 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.2 }}
              >
                <div
                  onClick={() => handleClick(item.href)}
                  key={item.title}
                  className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition"
                >
                  <div className="h-5 w-5 text-black dark:text-white">
                    {item.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shadow-md"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
      </button>
    </div>
  );
};

// ---------------- DESKTOP ----------------
const FloatingDocDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-16 gap-6 items-end px-6 pb-3",
        "backdrop-blur-xl bg-white/20 dark:bg-neutral-900/40 shadow-lg border border-white/10 rounded-2xl",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer key={item.title} mouseX={mouseX} {...item} />
      ))}
    </motion.div>
  );
};

// ---------------- ICON CONTAINER ----------------
const IconContainer = ({
  title,
  mouseX,
  icon,
  href,
}: {
  title: string;
  mouseX: MotionValue;
  icon: React.ReactNode;
  href: string;
}) => {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Dock scaling effect
  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    window.location.href = href;
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative shadow-md hover:shadow-xl transition-all"
      >
        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-1 rounded-md bg-black/70 text-white text-xs absolute left-1/2 -translate-x-1/2 -top-10 shadow-lg backdrop-blur-sm"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center text-black dark:text-white transition-colors"
        >
          {icon}
        </motion.div>
      </motion.div>
    </div>
  );
};
