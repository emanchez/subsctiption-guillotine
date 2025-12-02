import { CSSProperties, ReactNode } from "react";

// simple props interface, intended to be a parent to other components with custom props
export interface Props {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
