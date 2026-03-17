import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RevealTranslation, TranslationToggle } from "@/components/translation";

describe("RevealTranslation", () => {
  it("renders nothing when fr is null/undefined", () => {
    const { container } = render(<RevealTranslation fr={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when fr is empty string", () => {
    const { container } = render(<RevealTranslation fr="" />);
    expect(container.innerHTML).toBe("");
  });

  it("shows FR button when fr text is provided and globalShow is false", () => {
    render(<RevealTranslation fr="Bonjour le monde" />);
    expect(screen.getByText("FR")).toBeTruthy();
  });

  it("shows translation directly when globalShow is true", () => {
    render(<RevealTranslation fr="Bonjour le monde" globalShow={true} />);
    expect(screen.getByText("Bonjour le monde")).toBeTruthy();
  });

  it("reveals translation on FR button click", () => {
    render(<RevealTranslation fr="Bonjour le monde" />);
    fireEvent.click(screen.getByText("FR"));
    expect(screen.getByText("Bonjour le monde")).toBeTruthy();
  });
});

describe("TranslationToggle", () => {
  it("renders with inactive state", () => {
    const fn = () => {};
    render(<TranslationToggle active={false} onToggle={fn} />);
    expect(screen.getByText("FR")).toBeTruthy();
  });

  it("renders with active state", () => {
    const fn = () => {};
    render(<TranslationToggle active={true} onToggle={fn} />);
    expect(screen.getByText("FR ON")).toBeTruthy();
  });

  it("calls onToggle when clicked", () => {
    let called = false;
    render(<TranslationToggle active={false} onToggle={() => { called = true; }} />);
    fireEvent.click(screen.getByText("FR"));
    expect(called).toBe(true);
  });
});
