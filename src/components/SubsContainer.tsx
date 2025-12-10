import React from "react";
import { Props } from "@/lib/util/props";
import { User } from "@prisma/client";

export interface SubContainerProps extends Props {
  user?: User;
  // accept any children; we'll inject `user` at render-time
  children?: React.ReactNode;
}

interface ChildProps {
  user?: User;
}

/**
 * Subscription Container Component
 *
 * Wrapper component that provides user context to all child components.
 * Uses React.Children.map to inject the user prop into each child component
 * that accepts it, enabling user-specific functionality throughout the component tree.
 *
 * This pattern allows child components to access user data without explicit prop drilling.
 */
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
