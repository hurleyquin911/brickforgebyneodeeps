import { Bricolage_Grotesque, Caveat } from "next/font/google";

export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const scribble = Caveat({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-caveat",
});
