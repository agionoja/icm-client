import {
  SlArrowDown,
  SlArrowLeft,
  SlArrowRight,
  SlArrowUp,
} from "react-icons/sl";
import type { IconBaseProps } from "react-icons";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { BsDot } from "react-icons/bs";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";

export const ArrowRight = (props: IconBaseProps) => <SlArrowRight {...props} />;
export const ArrowLeft = (props: IconBaseProps) => <SlArrowLeft {...props} />;
export const ArrowUp = (props: IconBaseProps) => <SlArrowUp {...props} />;
export const ArrowDown = (props: IconBaseProps) => <SlArrowDown {...props} />;
export const Dot = (props: IconBaseProps) => <BsDot {...props} />;
export const Eye = (props: IconBaseProps) => <LuEye {...props} />;
export const EyeSlash = (props: IconBaseProps) => <LuEyeOff {...props} />;
export const Google = (props: IconBaseProps) => <FcGoogle {...props} />;
export const Facebook = (props: IconBaseProps) => <FaFacebook {...props} />;
export const Email = (props: IconBaseProps) => <TfiEmail {...props} />;
export const Close = (props: IconBaseProps) => <IoMdClose {...props} />;
export const Hamburger = (props: IconBaseProps) => (
  <RxHamburgerMenu {...props} />
);
export const ThreeVerticalDots = (props: IconBaseProps) => (
  <HiOutlineDotsVertical {...props} />
);

export const AvatarIcon = (props: IconBaseProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="none"
    viewBox="0 0 48 48"
    {...props}
  >
    <g clipPath="url(#clip0_197_231)">
      <rect width="48" height="48" fill="#F3F3F3" rx="24"></rect>
      <circle cx="24" cy="51" r="21" fill="#CBD5E1"></circle>
      <circle cx="24" cy="19.5" r="7.5" fill="#CBD5E1"></circle>
    </g>
    <rect width="47" height="47" x="0.5" y="0.5" stroke="#fff" rx="23.5"></rect>
    <defs>
      <clipPath id="clip0_197_231">
        <rect width="48" height="48" fill="#fff" rx="24"></rect>
      </clipPath>
    </defs>
  </svg>
);
