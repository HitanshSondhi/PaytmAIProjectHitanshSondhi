import { motion } from "framer-motion";
import type { VoiceResponse } from "../types";
import { ScoreArc } from "./ScoreArc";

interface ResponseCardProps {
  response: VoiceResponse;
}

export function ResponseCard({ response }: ResponseCardProps) {
  const { responseText, responseType, responseData } = response;

  const renderContent = () => {
    switch (responseType) {
      case "collection": {
        const days = responseData.days as
          | Array<{ date: string; total: number }>
          | undefined;
        return (
          <div className="space-y-2">
            <p className="text-white/80 text-sm leading-relaxed">
              {responseText}
            </p>
            {responseData.total !== undefined && (
              <div className="text-3xl font-bold text-white">
                ₹{Number(responseData.total).toLocaleString("en-IN")}
              </div>
            )}
            {days && days.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/60 whitespace-nowrap"
                  >
                    {new Date(day.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                    })}
                    <div className="text-white font-medium">
                      ₹{day.total.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "customer_payment": {
        const method = responseData.method as string | undefined;
        return (
          <div className="space-y-2">
            <p className="text-white/80 text-sm leading-relaxed">
              {responseText}
            </p>
            {responseData.amount !== undefined &&
              Number(responseData.amount) > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-400">
                    ₹{Number(responseData.amount).toLocaleString("en-IN")}
                  </span>
                  {method && (
                    <span className="text-xs text-white/40 uppercase">
                      {method}
                    </span>
                  )}
                </div>
                )}
          </div>
        );
      }

      case "payment_recorded": {
        const method = responseData.method as string | undefined;
        return (
          <div className="space-y-2">
            <p className="text-white/80 text-sm leading-relaxed">
              {responseText}
            </p>
            {responseData.amount !== undefined && (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-400">
                  ₹{Number(responseData.amount).toLocaleString("en-IN")}
                </span>
                {method && (
                  <span className="text-xs text-white/40 uppercase">
                    {method}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }

      case "credit_score": {
        const customer = responseData.customer as string | undefined;
        const category = responseData.category as string | undefined;
        const warning = responseData.warning as boolean | undefined;
        return (
          <div className="space-y-3">
            <p className="text-white/80 text-sm leading-relaxed">
              {responseText}
            </p>
            <div className="flex items-center gap-4">
              {responseData.score !== undefined && (
                <ScoreArc score={Number(responseData.score)} size={80} />
              )}
              <div>
                <div className="text-white font-medium">{customer || ""}</div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                    category === "Good"
                      ? "bg-green-500/20 text-green-400"
                      : category === "Average"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {category || ""}
                </div>
              </div>
            </div>
            {warning && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-300 text-xs">
                Credit risk warning - proceed with caution
              </div>
            )}
          </div>
        );
      }

      case "udhaar_summary": {
        const dueDate = responseData.dueDate as string | undefined;
        const customer = responseData.customer as string | undefined;
        const score = responseData.score as number | undefined;
        const category = score !== undefined
          ? score >= 85 ? "Good" : score >= 60 ? "Average" : "Risky"
          : undefined;
        return (
          <div className="space-y-3">
            <p className="text-white/80 text-sm leading-relaxed">
              {responseText}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-indigo-400">
                    ₹{Number(responseData.amount || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-white/40 text-xs">udhaar</span>
                </div>
                {customer && (
                  <div className="text-white/60 text-sm mt-1">{customer}</div>
                )}
                {dueDate && (
                  <div className="text-white/50 text-xs mt-1">
                    Due:{" "}
                    {new Date(dueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                )}
              </div>
              {score !== undefined && (
                <div className="flex flex-col items-center">
                  <ScoreArc score={score} size={60} />
                  {category && (
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                        category === "Good"
                          ? "bg-green-500/20 text-green-400"
                          : category === "Average"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {category}
                    </div>
                  )}
                </div>
              )}
            </div>
            {score !== undefined && score < 60 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-300 text-xs">
                ⚠️ Low credit score - monitor this customer
              </div>
            )}
          </div>
        );
      }

      case "due_list": {
        const customers = responseData.customers as
          | Array<{ customerName: string; amount: number }>
          | undefined;
        return (
          <div className="space-y-2">
            <p className="text-white/80 text-sm leading-relaxed">
              {responseText}
            </p>
            {customers && customers.length > 0 && (
              <div className="space-y-2 mt-3">
                {customers.slice(0, 3).map((c, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2"
                  >
                    <span className="text-white text-sm">{c.customerName}</span>
                    <span className="text-amber-400 font-medium">
                      ₹{c.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "customer_due": {
        const customer = responseData.customer as string | undefined;
        const totalDue = responseData.totalDue as number | undefined;
        const pendingCount = responseData.pendingCount as number | undefined;
        const pendingAmount = responseData.pendingAmount as number | undefined;
        const overdueCount = responseData.overdueCount as number | undefined;
        const overdueAmount = responseData.overdueAmount as number | undefined;
        const score = responseData.score as number | undefined;
        const category = score !== undefined
          ? score >= 85 ? "Good" : score >= 60 ? "Average" : "Risky"
          : undefined;
        return (
          <div className="space-y-3">
            <p className="text-white/80 text-sm leading-relaxed">
              {responseText}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-400">
                    ₹{Number(totalDue || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-white/40 text-xs">total due</span>
                </div>
                {customer && (
                  <div className="text-white/60 text-sm mt-1">{customer}</div>
                )}
                {pendingCount !== undefined && pendingCount > 0 && (
                  <div className="text-white/50 text-xs mt-1">
                    {pendingCount} pending {pendingCount === 1 ? 'entry' : 'entries'}
                  </div>
                )}
              </div>
              {score !== undefined && (
                <div className="flex flex-col items-center">
                  <ScoreArc score={score} size={60} />
                  {category && (
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                        category === "Good"
                          ? "bg-green-500/20 text-green-400"
                          : category === "Average"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {category}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Breakdown of pending vs overdue */}
            {(pendingAmount !== undefined || overdueAmount !== undefined) && (
              <div className="flex gap-3 mt-2">
                {pendingAmount !== undefined && pendingAmount > 0 && (
                  <div className="bg-white/5 rounded-lg px-3 py-2 flex-1">
                    <div className="text-white/50 text-xs">Pending</div>
                    <div className="text-amber-300 font-medium">
                      ₹{pendingAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                )}
                {overdueAmount !== undefined && overdueAmount > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex-1">
                    <div className="text-red-400/70 text-xs">Overdue ({overdueCount || 0})</div>
                    <div className="text-red-400 font-medium">
                      ₹{overdueAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                )}
              </div>
            )}
            {score !== undefined && score < 60 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-300 text-xs">
                ⚠️ Low credit score - consider follow-up
              </div>
            )}
          </div>
        );
      }

      default:
        return (
          <p className="text-white/80 text-sm leading-relaxed">{responseText}</p>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
    >
      <div
        className="flex items-start gap-3 px-4 py-4 rounded-2xl"
        style={{
          background: "rgba(30, 30, 50, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Speaker icon */}
        <div className="shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
    </motion.div>
  );
}
