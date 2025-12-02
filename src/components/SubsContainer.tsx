import React from "react";
import { Props } from "@/util/props";
import { User } from "@prisma/client";

export interface SubContainerProps extends Props {
  user?: User;
  // accept any children; we'll inject `user` at render-time
  children?: React.ReactNode;
}

interface ChildProps {
  user?: User;
}

const SubsContainer = (props: SubContainerProps) => {
  const childrenWithProps = React.Children.map(props.children, (child) => {
    if (React.isValidElement<ChildProps>(child)) {
      // inject `user` into each child component with proper type safety
      return React.cloneElement(child as React.ReactElement<ChildProps>, {
        user: props.user,
      });
    }
    return child;
  });
  return (
    <div id={props.id} className={props.className} style={props.style}>
      {childrenWithProps}
    </div>
  );
};

export default SubsContainer;
