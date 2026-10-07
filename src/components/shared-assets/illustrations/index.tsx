import type { HTMLAttributes } from "react";
import { CloudIllustration } from "./cloud";

// Only the cloud illustration is vendored; add the others from upstream when a page needs them.
const types = {
    cloud: CloudIllustration,
};

export interface IllustrationProps extends HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg";
    svgClassName?: string;
    childrenClassName?: string;
}

export const Illustration = (props: IllustrationProps & { type: keyof typeof types }) => {
    const { type, ...otherProps } = props;

    const Component = types[type];

    return <Component {...otherProps} />;
};
