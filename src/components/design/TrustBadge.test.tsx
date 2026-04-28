import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TrustBadge } from "./TrustBadge";

describe("TrustBadge", () => {
  it("renders 'good' tier for score >= 90", () => {
    const { container } = render(<TrustBadge score={95} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("trust");
    expect(el.className).toContain("good");
  });

  it("renders 'warn' tier for 70 <= score < 90", () => {
    const { container } = render(<TrustBadge score={80} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("trust");
    expect(el.className).toContain("warn");
  });

  it("renders 'bad' tier for score < 70", () => {
    const { container } = render(<TrustBadge score={60} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("trust");
    expect(el.className).toContain("bad");
  });

  it("renders the score percentage in its text content", () => {
    render(<TrustBadge score={95} />);
    expect(screen.getByText(/95\s*%/)).toBeInTheDocument();
  });

  it("invokes onClick AND stops propagation to parent", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const parentSpy = vi.fn();
    render(
      <div onClick={parentSpy}>
        <TrustBadge score={95} onClick={onClick} />
      </div>,
    );
    await user.click(screen.getByText(/95\s*%/));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(parentSpy).not.toHaveBeenCalled();
  });
});
