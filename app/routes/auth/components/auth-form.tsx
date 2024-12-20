import { Form, type FormProps } from "react-router";

export function AuthForm({ children, className, ...rest }: FormProps) {
  return (
    <Form
      method={"POST"}
      encType={"application/x-www-form-urlencoded"}
      className={`flex flex-col items-center gap-4 ${className}`}
      {...rest}
    >
      {children}
    </Form>
  );
}
