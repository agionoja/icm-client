export function AuthHeading({
  heading,
  text,
}: {
  heading: string;
  text: string;
}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <h2 className={"text-xs font-medium md:text-xl"}>{heading}</h2>
        <p className={"text-xs opacity-50 md:text-lg"}>{text}</p>
      </div>
    </>
  );
}
