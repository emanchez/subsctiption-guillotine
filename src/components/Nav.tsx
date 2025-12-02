import { Props } from "@/util/props";
import { JSX } from "react";
import Link from "next/link";
import { User } from "@/types/user";

// properties exclusive to navigation
interface NavProps extends Props {
  user?: User | null;
}

// navigation components

const Nav = (props: NavProps): JSX.Element => {
  return (
    <div id={props.id} className={props.className} style={props.style}>
      <nav aria-label="main">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/">Logout</Link>
          </li>
        </ul>
      </nav>
      {props.children}
    </div>
  );
};

export default Nav;
