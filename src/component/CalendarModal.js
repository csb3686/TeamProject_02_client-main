import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "../css/calendarModal.css";
import axios from "axios";

function CalendarModal({
  mode = "range",
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  selectedDate,
  setSelectedDate,
  filterDate,
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);

  // 초기값 설정
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (mode === "single" || mode === "singleModal") {
      setSelectedDate?.(today);
      setTempStartDate(today);
    } else {
      setStartDate?.(today);
      setEndDate?.(tomorrow);
      setTempStartDate(today);
      setTempEndDate(tomorrow);
    }

    if (mode === "packageDateRange") {
      if (startDate && startDate.getTime() !== tempStartDate?.getTime()) {
        setTempStartDate(startDate);
      }
      if (endDate && endDate.getTime() !== tempEndDate?.getTime()) {
        setTempEndDate(endDate);
      }
    }
  }, [mode]);

  // 숙박일수 계산
  const getNights = () => {
    if (!startDate || !endDate) return 0;
    return (endDate - startDate) / (1000 * 60 * 60 * 24);
  };

  // 날짜 포맷
  const formatDate = (date) =>
    date?.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });

  // 모달 외부 클릭 닫기
  useEffect(() => {
    if (mode === "range") {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setShowCalendar(false);
          setTempStartDate(startDate);
          setTempEndDate(endDate);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mode, startDate, endDate, selectedDate]);

  // 모달 열기/닫기
  const handleToggleCalendar = () => {
    if (!showCalendar) {
      if (mode === "range" || mode === "rangeModal") {
        setTempStartDate(startDate);
        setTempEndDate(endDate);
      } else if (mode === "singleModal" || mode === "pkSingleModal") {
        setTempStartDate(selectedDate);
      } else if (mode === "packageDateRange") {
        setTempStartDate(startDate ? new Date(startDate) : null);
        setTempEndDate(endDate ? new Date(endDate) : null);
      }
    }
    setShowCalendar(!showCalendar);
  };

  // 적용 버튼
  const handleApply = () => {
    if (mode === "single" || mode === "singleModal") {
      setSelectedDate?.(tempStartDate);
    } else {
      setStartDate?.(tempStartDate);
      setEndDate?.(tempEndDate);
    }
    setShowCalendar(false);
  };

  return (
    <div className="calendarContainer" ref={containerRef}>
      {/* 1️⃣ single → 인라인 */}
      {mode === "single" && (
        <DatePicker
          selected={selectedDate || tempStartDate}
          onChange={(date) => {
            setTempStartDate(date);
            setSelectedDate?.(date);
          }}
          inline
          monthsShown={2}
          locale={ko}
          minDate={new Date()}
          calendarClassName="singleCalendar"
          className="singleCalendarWrapper"
        />
      )}

      {/* 2️⃣ singleModal → 모달 단일 */}
      {mode === "singleModal" && (
        <>
          <button className="calendarButton" onClick={handleToggleCalendar}>
            <span className="dateText">
              {selectedDate ? formatDate(selectedDate) : "날짜 선택"}
            </span>
          </button>

          {showCalendar &&
            createPortal(
              <div
                className="singleModalOverlay"
                onClick={() => setShowCalendar(false)}
              >
                <div
                  className="singleModalBox"
                  onClick={(e) => e.stopPropagation()}
                  ref={modalRef}
                >
                  <div className="singleModalHeader">
                    <span>출발일 선택</span>
                    <button
                      type="button"
                      className="singleModalClose"
                      onClick={() => setShowCalendar(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="calendarBody">
                    <DatePicker
                      selected={tempStartDate}
                      onChange={(date) => setTempStartDate(date)}
                      inline
                      monthsShown={2}
                      locale={ko}
                      minDate={new Date()}
                    />
                  </div>

                  <button
                    className="applyBtn singleModalApply"
                    onClick={handleApply}
                  >
                    적용하기
                  </button>
                </div>
              </div>,
              document.body
            )}
        </>
      )}

      {/* 3️⃣ range → 호텔 모달 */}
      {mode === "range" && (
        <>
          <button className="calendarButton" onClick={handleToggleCalendar}>
            <div className="calendarButtonText">
              {startDate ? (
                <>
                  <span className="dateText">{formatDate(startDate)}</span>
                  {endDate ? (
                    <>
                      <span className="middleText">~</span>
                      <span className="dateText">{formatDate(endDate)}</span>
                      <span className="lastText">{getNights()}박</span>
                    </>
                  ) : (
                    <span className="middleText"> ~ 날짜 선택</span>
                  )}
                </>
              ) : (
                "~ 날짜 선택"
              )}
            </div>
          </button>

          {showCalendar && (
            <div className="calendarModal" ref={modalRef}>
              <div className="calendarBody">
                <DatePicker
                  selected={tempStartDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setTempStartDate(start);
                    setTempEndDate(end);
                  }}
                  startDate={tempStartDate}
                  endDate={tempEndDate}
                  selectsRange
                  inline
                  monthsShown={2}
                  locale={ko}
                  minDate={new Date()}
                />
              </div>

              <button
                className="applyBtn"
                disabled={!tempStartDate || !tempEndDate}
                onClick={handleApply}
              >
                적용하기
              </button>
            </div>
          )}
        </>
      )}

      {/* 4️⃣ rangeModal */}
      {mode === "rangeModal" && (
        <>
          <button className="calendarButton" onClick={handleToggleCalendar}>
            <div className="calendarButtonText">
              {startDate ? (
                <>
                  <span className="dateText">{formatDate(startDate)}</span>
                  {endDate ? (
                    <>
                      <span className="middleText">~</span>
                      <span className="dateText">{formatDate(endDate)}</span>
                      <span className="lastText">{getNights()}박</span>
                    </>
                  ) : (
                    <span className="middleText"> ~ 날짜 선택</span>
                  )}
                </>
              ) : (
                "~ 날짜 선택"
              )}
            </div>
          </button>

          {showCalendar &&
            createPortal(
              <div
                className="rangeModalOverlay"
                onClick={() => {
                  setShowCalendar(false);
                  setTempStartDate(startDate);
                  setTempEndDate(endDate);
                }}
              >
                <div
                  className="rangeModalBox"
                  onClick={(e) => e.stopPropagation()}
                  ref={modalRef}
                >
                  <div className="rangeModalHeader">
                    <span>체크인 / 체크아웃 선택</span>
                    <button
                      type="button"
                      className="singleModalClose"
                      onClick={() => setShowCalendar(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="calendarBody">
                    <DatePicker
                      selected={tempStartDate}
                      onChange={(dates) => {
                        const [start, end] = dates;
                        setTempStartDate(start);
                        setTempEndDate(end);
                      }}
                      startDate={tempStartDate}
                      endDate={tempEndDate}
                      selectsRange
                      inline
                      monthsShown={2}
                      locale={ko}
                      minDate={new Date()}
                    />
                  </div>

                  <button
                    className="applyBtn rangeModalApply"
                    disabled={!tempStartDate || !tempEndDate}
                    onClick={handleApply}
                  >
                    적용하기
                  </button>
                </div>
              </div>,
              document.body
            )}
        </>
      )}

      {/* 5️⃣ packageDateRange */}
      {mode === "packageDateRange" && (
        <>
          <button className="calendarButton" onClick={handleToggleCalendar}>
            <div className="calendarButtonText">
              {startDate instanceof Date ? (
                <>
                  <span className="dateText">{formatDate(startDate)}</span>
                  {endDate instanceof Date ? (
                    <>
                      <span className="middleText">~</span>
                      <span className="dateText">{formatDate(endDate)}</span>
                      <span className="lastText">{getNights()}박</span>
                    </>
                  ) : (
                    <span className="middleText"> ~ 날짜 선택</span>
                  )}
                </>
              ) : (
                "~ 날짜 선택"
              )}
            </div>
          </button>

          {showCalendar &&
            createPortal(
              <div
                className="rangeModalOverlay"
                onClick={() => {
                  setShowCalendar(false);
                  setTempStartDate(startDate);
                  setTempEndDate(endDate);
                }}
              >
                <div
                  className="rangeModalBox"
                  onClick={(e) => e.stopPropagation()}
                  ref={modalRef}
                >
                  <div className="rangeModalHeader">
                    <span>체크인 / 체크아웃 선택</span>
                    <button
                      type="button"
                      className="singleModalClose"
                      onClick={() => setShowCalendar(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="calendarBody">
                    <DatePicker
                      selected={tempStartDate}
                      onChange={(dates) => {
                        const [start, end] = dates;
                        setTempStartDate(start);
                        setTempEndDate(end);
                      }}
                      startDate={tempStartDate}
                      endDate={tempEndDate}
                      selectsRange
                      inline
                      monthsShown={2}
                      locale={ko}
                      filterDate={(date) => {
                        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                        const s = startDate instanceof Date ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime() : null;
                        const e = endDate instanceof Date ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() : null;
                        return (!s || d >= s) && (!e || d <= e);
                      }}
                      minDate={startDate || undefined}
                      maxDate={endDate || undefined}
                    />
                  </div>

                  <button
                    className="applyBtn rangeModalApply"
                    disabled={!tempStartDate || !tempEndDate}
                    onClick={handleApply}
                  >
                    적용하기
                  </button>
                </div>
              </div>,
              document.body
            )}
        </>
      )}

      {/* 6️⃣ pkSingleModal */}
      {mode === "pkSingleModal" && (
        <>
          <button className="calendarButton" onClick={handleToggleCalendar}>
            <span className="dateText">
              {selectedDate ? formatDate(selectedDate) : "날짜 선택"}
            </span>
          </button>

          {showCalendar &&
            createPortal(
              <div
                className="singleModalOverlay"
                onClick={() => setShowCalendar(false)}
              >
                <div
                  className="singleModalBox"
                  onClick={(e) => e.stopPropagation()}
                  ref={modalRef}
                >
                  <div className="singleModalHeader">
                    <span>출발일 선택</span>
                    <button
                      type="button"
                      className="singleModalClose"
                      onClick={() => setShowCalendar(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="calendarBody">
                    <DatePicker
                      selected={tempStartDate}
                      onChange={(date) => {setTempStartDate(date); setSelectedDate?.(date);}}
                      inline
                      monthsShown={2}
                      locale={ko}
                      minDate={new Date()}
                      filterDate={filterDate}
                    />
                  </div>

                  <button
                    className="applyBtn singleModalApply"
                    onClick={handleApply}
                  >
                    적용하기
                  </button>
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
}

export default CalendarModal;
