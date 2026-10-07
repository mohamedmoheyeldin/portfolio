import type { SVGProps } from "react";
import { cx } from "@/utils/cx";
import { Grid } from "./grid";

// Only the grid pattern is vendored; add the others from upstream when a page needs them.
const patterns = {
    grid: Grid,
};

export interface BackgroundPatternProps extends Omit<SVGProps<SVGSVGElement>, "size"> {
    size?: "sm" | "md" | "lg";
    pattern: keyof typeof patterns;
}

export const BackgroundPattern = (props: BackgroundPatternProps) => {
    const { pattern } = props;
    const Pattern = patterns[pattern];

    return <Pattern {...props} size={props.size as "sm" | "md"} className={cx("pointer-events-none", props.className)} />;
};
