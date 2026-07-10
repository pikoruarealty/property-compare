import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, MessageCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Section } from "./Section";
import type { Property } from "@/types/property";

const WHATSAPP_NUMBER = "916354359222"; // +91 63543 59222

// Slots every 30 minutes from 10:00 to 19:00 (last slot 18:30)
const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 10; h < 19; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function ContactActions({ properties }: { properties: Property[] }) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [booked, setBooked] = useState(false);

  const propertyList = useMemo(
    () => properties.map((p) => `• ${p.name}${p.location ? ` (${p.location})` : ""}`).join("\n"),
    [properties],
  );

  const inquiryMessage = useMemo(() => {
    const intro = `Hi Pikorua team, I'd like to inquire about the following residences I'm comparing:`;
    return `${intro}\n${propertyList}\n\nPlease share more details.`;
  }, [propertyList]);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(inquiryMessage)}`;

  const handleBookVisit = () => {
    if (!date || !time) return;
    const dateStr = format(date, "PPP");
    const msg =
      `Hi Pikorua team, I'd like to book a site visit.\n\n` +
      `Date: ${dateStr}\nTime: ${to12h(time)}\n\nProperties of interest:\n${propertyList}`;
    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(href, "_blank", "noopener,noreferrer");
    setBooked(true);
    setTimeout(() => setBooked(false), 2500);
  };

  const today = startOfDay(new Date());

  return (
    <Section
      id="contact"
      eyebrow="07 · Next Steps"
      title="Ready to take the next step?"
      description="Speak with our advisory desk or reserve a private site visit at your convenience."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inquiry Now */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass-strong relative flex flex-col overflow-hidden rounded-[32px] p-8 sm:p-10"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-champagne/15 text-champagne">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] tracking-luxury text-champagne">Instant chat</p>
              <h3 className="font-display text-2xl text-ivory">Inquire Now</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Get quick answers from our team on pricing, availability, floor plans and more —
            directly on WhatsApp.
          </p>
          <div className="mt-auto pt-6">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-champagne to-muted-gold px-6 py-3.5 text-xs tracking-luxury text-lux-black shadow-[0_10px_30px_-10px_rgba(200,164,93,0.6)] transition-transform hover:scale-[1.01]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>

        {/* Book a site visit */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-strong relative flex flex-col overflow-hidden rounded-[32px] p-8 sm:p-10"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-champagne/15 text-champagne">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] tracking-luxury text-champagne">In-person tour</p>
              <h3 className="font-display text-2xl text-ivory">Book a Site Visit</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Pick a date and a time slot between 10:00 AM and 7:00 PM. We'll confirm your visit
            over WhatsApp.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setTime(undefined);
                  }}
                  disabled={(d) => isBefore(d, today) || isBefore(addDays(today, 60), d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!date}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !time && "text-muted-foreground",
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {time ? to12h(time) : <span>Pick a time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pointer-events-auto">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        "rounded-md border px-2 py-1.5 text-xs transition-colors",
                        time === slot
                          ? "border-champagne bg-champagne/20 text-champagne"
                          : "border-border hover:border-champagne/60 hover:text-champagne",
                      )}
                    >
                      {to12h(slot)}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={handleBookVisit}
              disabled={!date || !time}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full gold-border px-6 py-3.5 text-xs tracking-luxury text-champagne transition-colors hover:bg-champagne hover:text-lux-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {booked ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Request Sent
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4" /> Confirm Site Visit
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
