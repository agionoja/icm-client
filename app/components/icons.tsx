import {
  SlArrowDown,
  SlArrowLeft,
  SlArrowRight,
  SlArrowUp,
} from "react-icons/sl";
import { IconBaseProps } from "react-icons";
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
