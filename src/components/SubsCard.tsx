"use client";
import React from "react";
import { SubContainerProps } from "./SubsContainer";
import { ApiSubscription } from "@/types/subscription";

interface SubCardProps extends SubContainerProps {
  subscription: ApiSubscription;
}

const SubsCard = (props: SubCardProps) => {
  const { subscription } = props;
  return (
    <div id={props.id} className={props.className} style={props.style}>
      <h4>{subscription.name}</h4>
      <div>
        {subscription.cycle} — ${subscription.cost}
      </div>
      <div>Renewal: {subscription.renewalDate ?? "unknown"}</div>
      {subscription.notes && <p>{subscription.notes}</p>}
    </div>
  );
};

export default SubsCard;
