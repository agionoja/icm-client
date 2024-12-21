export type AuthHeadingProps = {
  text: string;
  heading: string;
};

export function AuthHeading({ heading, text }: AuthHeadingProps) {
  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h2 className={"text-md font-medium md:text-lg"}>{heading}</h2>
        <p className={"text-sm opacity-50 md:text-md"}>{text}</p>
      </div>
    </>
  );
}
