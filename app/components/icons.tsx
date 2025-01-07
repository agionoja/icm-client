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

export const NoResultIcon = (props: IconBaseProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="98"
    height="97"
    fill="none"
    viewBox="0 0 98 97"
    {...props}
  >
    <ellipse
      cx="49"
      cy="93.745"
      fill="#B9B9B9"
      opacity="0.1"
      rx="48.322"
      ry="2.899"
    ></ellipse>
    <path
      fill="#B9B9B9"
      fillRule="evenodd"
      d="M38.086 21.262a5.32 5.32 0 0 1 5.115-3.866h19.604a13.6 13.6 0 0 0-4.132 3.866zm19.464 1.932H29.187a5.8 5.8 0 0 0-5.798 5.8V64.75h30.443c.533 0 .966.433.966.967v5.074a7.49 7.49 0 1 0 14.98 0V42.523c-7.473 0-13.53-6.057-13.53-13.53 0-2.075.467-4.041 1.302-5.799m14.16 19.192v27.118a5.8 5.8 0 0 0 4.833-5.719V40.713a13.4 13.4 0 0 1-4.832 1.673m6.766-3.029v24.428c0 3.95-2.963 7.21-6.788 7.675-.343 4.892-4.42 8.755-9.4 8.755q-.126 0-.252-.004l.01.004H27.256c-5.338 0-9.665-4.327-9.665-9.665v-1.933a3.866 3.866 0 0 1 3.866-3.866V28.993a7.73 7.73 0 0 1 7.731-7.731h6.91a7.25 7.25 0 0 1 7.104-5.8h25.61v.035q.48-.034.967-.034c7.473 0 13.53 6.058 13.53 13.53 0 4.16-1.878 7.883-4.832 10.364M12.275 74.174a.725.725 0 1 1 1.45 0v.242c0 5.337 4.326 9.664 9.664 9.664h2.223a.677.677 0 0 1 0 1.353h-2.223c-6.416 0-11.114-4.622-11.114-11.017zm.724-2.657a2.66 2.66 0 0 0-2.657 2.657v.242c0 7.483 5.585 12.95 13.047 12.95h2.223a2.61 2.61 0 1 0 0-5.219h-2.223a7.73 7.73 0 0 1-7.732-7.731v-.242A2.66 2.66 0 0 0 13 71.517m15.222-22.712a2.416 2.416 0 0 1 2.416-2.416h14.497a2.416 2.416 0 1 1 0 4.832H30.637a2.416 2.416 0 0 1-2.416-2.416m2.416-.483a.483.483 0 0 0 0 .966h14.497a.483.483 0 0 0 0-.966zm5.754-5.647q.11.11.349.11.204 0 .297-.11.102-.11.102-.348v-.688a3.7 3.7 0 0 0 1.435-.45q.645-.375 1.037-1.087.399-.722.399-1.784 0-.918-.416-1.512a3.1 3.1 0 0 0-.969-.926 15 15 0 0 0-1.486-.73v-2.294q.424.017.713.093.298.077.604.196.211.084.28.085.17 0 .357-.238.195-.239.33-.552.137-.322.137-.527 0-.23-.315-.459-.305-.229-.866-.39a5 5 0 0 0-1.24-.187v-.467q0-.246-.102-.349-.102-.101-.348-.102-.204 0-.306.111-.102.102-.102.34v.475a4.3 4.3 0 0 0-1.512.45 2.83 2.83 0 0 0-1.096 1.02q-.407.654-.407 1.605 0 1.003.433 1.631.441.62 1.028.943.594.315 1.554.671v2.489a3.1 3.1 0 0 1-.968-.145 7 7 0 0 1-.892-.373q-.323-.17-.425-.17-.153 0-.382.238a2.3 2.3 0 0 0-.4.552q-.16.323-.16.543 0 .264.381.561.39.297 1.122.518.738.213 1.724.246v.663q0 .239.11.348m-.722-9.394q.171-.23.612-.34v1.818q-.382-.221-.586-.459a.86.86 0 0 1-.196-.56q0-.239.17-.46m1.946 5.895a1.1 1.1 0 0 1-.476.348v-1.911q.654.373.654.985 0 .348-.178.578m-9.394 17.36a2.416 2.416 0 0 1 2.416-2.415H59.63a2.416 2.416 0 1 1 0 4.832H30.637a2.416 2.416 0 0 1-2.416-2.416m2.416-.483a.483.483 0 1 0 0 .967H59.63a.483.483 0 1 0 0-.967zm27.544-27.06c0-6.405 5.192-11.597 11.597-11.597s11.597 5.192 11.597 11.597S76.183 40.59 69.778 40.59s-11.597-5.192-11.597-11.597m9.18-6.282a2.416 2.416 0 0 1 4.833 0v5.799a2.416 2.416 0 0 1-4.832 0zm2.417-.483a.483.483 0 0 0-.483.483v5.799a.483.483 0 0 0 .966 0V22.71a.483.483 0 0 0-.483-.483m0 15.463a2.416 2.416 0 1 1 0-4.832 2.416 2.416 0 0 1 0 4.832m-.483-2.416a.483.483 0 1 0 .966 0 .483.483 0 0 0-.966 0"
      clipRule="evenodd"
    ></path>
  </svg>
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
