import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./CalendarMeals.css";

export default function CalendarMeals() {
  const navigate = useNavigate();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [mealsByDay, setMealsByDay] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthDirection, setMonthDirection] = useState(0);

  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
  });

  const COLORS = ["#28a745", "#ff9800", "#007bff"];

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekdayOfMonth = (y, m) => new Date(y, m, 1).getDay();
  const monthName = (m) =>
    new Date(currentYear, m, 1).toLocaleString("default", { month: "long" });

  const makeDateKey = (year, monthZero, day) =>
    `${year}-${String(monthZero + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

  const selectedKey =
    selectedDay !== null ? makeDateKey(currentYear, currentMonth, selectedDay) : null;

  const todayKey = today.toISOString().split("T")[0];

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get("/meals");
        const data = Array.isArray(res.data) ? res.data : [];

        const grouped = {};
        data.forEach((meal) => {
          if (!meal?.date) return;

          const dateKey = String(meal.date).split("T")[0];
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(meal);
        });

        setMealsByDay(grouped);
      } catch (err) {
        console.error("Failed to load meals:", err);
      }
    };

    fetchMeals();
  }, []);

  const calendarCells = useMemo(() => {
    const totalDays = daysInMonth(currentYear, currentMonth);
    const prefix = firstWeekdayOfMonth(currentYear, currentMonth);

    const cells = [];
    for (let i = 0; i < prefix; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);

    const suffix = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < suffix; i++) cells.push(null);

    return cells;
  }, [currentMonth, currentYear]);

  const monthVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
      filter: "blur(2px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction) => ({
      x: direction < 0 ? 80 : -80,
      opacity: 0,
      filter: "blur(2px)",
    }),
  };

  const prevMonth = () => {
    setMonthDirection(-1);
    setCurrentMonth((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setMonthDirection(1);
    setCurrentMonth((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  const monthMealsFlat = useMemo(() => {
    const result = [];
    Object.keys(mealsByDay).forEach((key) => {
      if (key.startsWith(monthPrefix)) {
        result.push(...(mealsByDay[key] || []));
      }
    });
    return result;
  }, [mealsByDay, monthPrefix]);

  const monthTotals = useMemo(() => {
    return monthMealsFlat.reduce(
      (acc, m) => {
        acc.calories += Number(m.calories || 0);
        acc.protein += Number(m.protein || 0);
        acc.fat += Number(m.fat || 0);
        acc.carbs += Number(m.carbs || 0);
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  }, [monthMealsFlat]);

  const macroSum = monthTotals.protein + monthTotals.fat + monthTotals.carbs || 1;

  const pieData = useMemo(
    () => [
      { name: "Protein", value: monthTotals.protein },
      { name: "Fat", value: monthTotals.fat },
      { name: "Carbs", value: monthTotals.carbs },
    ],
    [monthTotals]
  );

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!selectedKey) return;

    const newMeal = {
      id: Date.now(),
      name: form.name.trim() || "Meal",
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      fat: Number(form.fat) || 0,
      carbs: Number(form.carbs) || 0,
      date: selectedKey,
    };

    try {
      await axios.post("/meals", newMeal);

      setMealsByDay((prev) => {
        const updated = { ...prev };
        const arr = updated[selectedKey] ? [...updated[selectedKey]] : [];
        arr.push(newMeal);
        updated[selectedKey] = arr;
        return updated;
      });

      setForm({ name: "", calories: "", protein: "", fat: "", carbs: "" });
    } catch (err) {
      console.error("Error adding meal:", err);
      alert("Failed to add meal. Check backend is running on port 5000.");
    }
  };

  const handleDeleteMeal = async (mealId, dateKey) => {
    try {
      setMealsByDay((prev) => {
        const updated = { ...prev };
        updated[dateKey] = (updated[dateKey] || []).filter((m) => m.id !== mealId);
        if (updated[dateKey].length === 0) delete updated[dateKey];
        return updated;
      });
    } catch (err) {
      console.error("Error deleting meal:", err);
      alert("Failed to delete meal.");
    }
  };

  const openDayModal = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
  };

  const mealsForSelectedDay = selectedKey ? mealsByDay[selectedKey] || [] : [];

  const mealRowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <div className="cc-page-outer">
      <div className="cc-month-wrap">
        <div className="cc-topbar">
          <button className="cc-back" onClick={() => navigate("/home")}>
            ← Back
          </button>

          <div className="cc-title">
            <h1>
              {monthName(currentMonth)} {currentYear}
            </h1>
            <div className="cc-sub">Monthly Meal Overview</div>
          </div>

          <div className="cc-controls">
            <button className="cc-nav" onClick={prevMonth} aria-label="Previous month">
              ◀
            </button>
            <button className="cc-nav" onClick={nextMonth} aria-label="Next month">
              ▶
            </button>
          </div>
        </div>

        <div className="cc-month-inner">
          <div className="cc-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="cc-weekday">
                {d}
              </div>
            ))}
          </div>

          <AnimatePresence custom={monthDirection} mode="wait">
            <motion.div
              key={`${currentMonth}-${currentYear}`}
              className="cc-grid"
              variants={monthVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={monthDirection}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={idx} className="cc-cell cc-empty" />;
                }

                const key = makeDateKey(currentYear, currentMonth, day);
                const count = mealsByDay[key]?.length || 0;

                const isToday = key === todayKey;

                return (
                  <div
                    key={idx}
                    className={`cc-cell ${isToday ? "cc-today" : ""}`}
                    onClick={() => openDayModal(day)}
                  >
                    <div className="cc-daynum">{day}</div>
                    {count > 0 && (
                      <div className={`cc-badge ${isToday ? "cc-badge-today" : ""}`}>
                        {count} meal{count > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <div className="cc-summary-card">
            <div className="cc-summary-head">
              <div>
                <h3 className="cc-summary-title">Monthly Nutrition Summary</h3>
                <div className="cc-summary-sub">
                  Total Calories: <span>{Math.round(monthTotals.calories)} kcal</span>
                </div>
              </div>

              <div className="cc-summary-macros">
                <div>
                  🥩 Protein <span>{((monthTotals.protein / macroSum) * 100).toFixed(1)}%</span>
                </div>
                <div>
                  🧈 Fat <span>{((monthTotals.fat / macroSum) * 100).toFixed(1)}%</span>
                </div>
                <div>
                  🍞 Carbs <span>{((monthTotals.carbs / macroSum) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="cc-chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={(entry) =>
                      `${entry.name} ${(entry.value / macroSum * 100).toFixed(1)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && selectedKey && (
            <motion.div
              className="cc-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(e) => {
                if (e.target.classList.contains("cc-modal-overlay")) closeModal();
              }}
            >
              <motion.div
                className="cc-modal"
                initial={{ y: 24, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 24, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
              >
                <div className="cc-modal-header">
                  <div>
                    <div className="cc-modal-date">
                      {new Date(selectedKey).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="cc-modal-summary">
                      {mealsForSelectedDay.length} meal{mealsForSelectedDay.length !== 1 ? "s" : ""} for this day
                    </div>
                  </div>

                  <button className="cc-close" onClick={closeModal} aria-label="Close">
                    <X />
                  </button>
                </div>

                <div className="cc-modal-body">
                  {mealsForSelectedDay.length === 0 ? (
                    <div className="cc-no-meals">No meals for this day.</div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {mealsForSelectedDay.map((m) => (
                        <motion.div
                          key={m.id}
                          className="cc-meal-row"
                          variants={mealRowVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          transition={{ duration: 0.18 }}
                        >
                          <div>
                            <div className="cc-meal-name">{m.name}</div>
                            <div className="cc-meal-nut">
                              {m.calories} kcal • {m.protein}g P • {m.fat}g F • {m.carbs}g C
                            </div>
                          </div>

                          <button
                            className="cc-trash"
                            onClick={() => handleDeleteMeal(m.id, selectedKey)}
                            aria-label="Delete meal"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}

                  <form onSubmit={handleAddMeal}>
                    <div className="cc-add-form">
                      <input
                        type="text"
                        placeholder="Meal name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Calories"
                        value={form.calories}
                        onChange={(e) => setForm({ ...form, calories: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Protein"
                        value={form.protein}
                        onChange={(e) => setForm({ ...form, protein: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Fat"
                        value={form.fat}
                        onChange={(e) => setForm({ ...form, fat: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Carbs"
                        value={form.carbs}
                        onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                      />
                    </div>

                    <div className="cc-add-row">
                      <button className="cc-btn-add" type="submit">
                        <Plus size={16} /> Add Meal
                      </button>
                      <button className="cc-btn-cancel" type="button" onClick={closeModal}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
