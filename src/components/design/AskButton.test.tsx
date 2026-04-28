import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AskButton } from "./AskButton";

describe("AskButton", () => {
  it("renders the default Dutch label 'Vraag hierover'", () => {
    render(<AskButton />);
    expect(screen.getByRole("button")).toHaveTextContent("Vraag hierover");
  });

  it("applies size class ask-btn-sm", () => {
    render(<AskButton size="sm" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("ask-btn");
    expect(btn.className).toContain("ask-btn-sm");
  });

  it("applies size class ask-btn-md (default)", () => {
    render(<AskButton size="md" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("ask-btn-md");
  });

  it("applies size class ask-btn-lg", () => {
    render(<AskButton size="lg" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("ask-btn-lg");
  });

  it("invokes onClick AND stops propagation to parent", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const parentSpy = vi.fn();
    render(
      <div onClick={parentSpy}>
        <AskButton onClick={onClick} />
      </div>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(parentSpy).not.toHaveBeenCalled();
  });

  it("supports a custom label override", () => {
    render(<AskButton label="Custom" />);
    expect(screen.getByRole("button")).toHaveTextContent("Custom");
  });

  it("appends className without losing the ask-btn base class", () => {
    render(<AskButton className="extra" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("ask-btn");
    expect(btn.className).toContain("extra");
  });
});
