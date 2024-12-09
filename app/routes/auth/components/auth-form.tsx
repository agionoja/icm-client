import { Form, FormProps } from "react-router";

export function AuthForm({ children, className, ...rest }: FormProps) {
  return (
    <Form className={`flex flex-col items-center gap-4 ${className}`} {...rest}>
      {children}
    </Form>
  );
}
