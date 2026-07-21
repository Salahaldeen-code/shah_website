"use client";

import { useState } from "react";
import {
  FaBehance,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

import type { CommitteeMember } from "@/config/committee";
import { cn } from "@/lib/utils";

export type TeamMember = CommitteeMember;

type TeamShowcaseProps = {
  members: TeamMember[];
};

export default function TeamShowcase({ members }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Staggered collage: 2 columns for 4 people, 3 columns otherwise
  const useTwoCols = members.length <= 4;
  const col1 = useTwoCols
    ? members.filter((_, i) => i % 2 === 0)
    : members.filter((_, i) => i % 3 === 0);
  const col2 = useTwoCols
    ? members.filter((_, i) => i % 2 === 1)
    : members.filter((_, i) => i % 3 === 1);
  const col3 = useTwoCols ? [] : members.filter((_, i) => i % 3 === 2);

  return (
    <div className="mx-auto flex w-full max-w-5xl select-none flex-col items-start gap-8 px-4 py-8 font-sans md:flex-row md:gap-10 md:px-6 lg:gap-14">
      {/* Left: photo grid */}
      <div className="flex flex-shrink-0 gap-2 overflow-x-auto pb-1 md:gap-3 md:pb-0">
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[132px] w-[122px] sm:h-[155px] sm:w-[145px] md:h-[182px] md:w-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        <div className="mt-[48px] flex flex-col gap-2 sm:mt-[56px] md:mt-[68px] md:gap-3">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[125px] w-[115px] sm:h-[146px] sm:w-[136px] md:h-[172px] md:w-[162px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {col3.length > 0 ? (
          <div className="mt-[22px] flex flex-col gap-2 sm:mt-[26px] md:mt-[32px] md:gap-3">
            {col3.map((member) => (
              <PhotoCard
                key={member.id}
                member={member}
                className="h-[125px] w-[115px] sm:h-[146px] sm:w-[136px] md:h-[172px] md:w-[162px]"
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Right: name list */}
      <div className="flex w-full flex-1 flex-col gap-4 pt-0 md:gap-5 md:pt-2">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        "flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-brand-dark/20 shadow-[0_10px_28px_rgb(0_0_0/0.18)] transition-opacity duration-400",
        className,
        isDimmed ? "opacity-55" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external committee portraits */}
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover transition-[filter] duration-500"
        style={{
          filter: isActive
            ? "grayscale(0) brightness(1)"
            : "grayscale(1) brightness(0.82)",
        }}
      />
    </div>
  );
}

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial =
    member.social?.twitter ??
    member.social?.linkedin ??
    member.social?.instagram ??
    member.social?.behance;

  return (
    <div
      className={cn(
        "cursor-pointer transition-opacity duration-300",
        isDimmed ? "opacity-45" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "h-3 w-4 flex-shrink-0 rounded-[5px] bg-brand-dark transition-all duration-300",
            isActive ? "w-5" : "opacity-35",
          )}
        />
        <span
          className={cn(
            "text-base leading-none font-semibold tracking-tight text-brand-dark transition-colors duration-300 md:text-[18px]",
            isActive ? "opacity-100" : "opacity-85",
          )}
        >
          {member.name}
        </span>

        {hasSocial ? (
          <div
            className={cn(
              "ml-0.5 flex items-center gap-1.5 transition-all duration-200",
              isActive
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0",
            )}
          >
            {member.social?.twitter ? (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-brand-dark/50 transition-all duration-150 hover:scale-110 hover:bg-brand-dark/10 hover:text-brand-dark"
                title="X / Twitter"
              >
                <FaTwitter size={10} />
              </a>
            ) : null}
            {member.social?.linkedin ? (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-brand-dark/50 transition-all duration-150 hover:scale-110 hover:bg-brand-dark/10 hover:text-brand-dark"
                title="LinkedIn"
              >
                <FaLinkedinIn size={10} />
              </a>
            ) : null}
            {member.social?.instagram ? (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-brand-dark/50 transition-all duration-150 hover:scale-110 hover:bg-brand-dark/10 hover:text-brand-dark"
                title="Instagram"
              >
                <FaInstagram size={10} />
              </a>
            ) : null}
            {member.social?.behance ? (
              <a
                href={member.social.behance}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-brand-dark/50 transition-all duration-150 hover:scale-110 hover:bg-brand-dark/10 hover:text-brand-dark"
                title="Behance"
              >
                <FaBehance size={10} />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-1.5 pl-[27px] text-[7px] font-medium tracking-[0.2em] text-brand-dark/55 uppercase md:text-[10px]">
        {member.role}
      </p>
    </div>
  );
}
