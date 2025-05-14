import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CalendarStyles.css";

const DateRangePicker = ({
  onDatesSelected,
  excludedDates = [],
  blockedDates = [],
}) => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  // Update parent component when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const datesInRange = getDatesInRange(checkInDate, checkOutDate);
      onDatesSelected(datesInRange);
    } else if (checkInDate) {
      onDatesSelected([checkInDate]);
    } else {
      onDatesSelected([]);
    }
  }, [checkInDate, checkOutDate, onDatesSelected]);

  // Helper function to get all dates between start and end
  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    // Ensure we're working with date objects and not strings
    const start = new Date(currentDate);
    const end = new Date(lastDate);

    // Set time to beginning of day to compare only dates
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Clone the start date to avoid modifying the original
    const temp = new Date(start);

    // Add each date in the range
    while (temp <= end) {
      dates.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }

    return dates;
  };

  // Handler for check-in date changes
  const handleCheckInChange = (date) => {
    setCheckInDate(date);
    // If check-out date is before or equal to the new check-in date, reset it
    if (checkOutDate && date && checkOutDate <= date) {
      setCheckOutDate(null);
    }
  };

  // Handler for check-out date changes
  const handleCheckOutChange = (date) => {
    // Only allow check-out date if check-in date is selected
    if (!checkInDate) {
      alert("Please select a check-in date first");
      return;
    }

    // Prevent selecting the same day for check-out
    if (date && date.getTime() === checkInDate.getTime()) {
      alert("Check-out date cannot be the same as check-in date");
      return;
    }

    setCheckOutDate(date);
  };

  // Function to compare dates without time consideration
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    return d1.getTime() === d2.getTime();
  };

  // Function to check if a date is available (not in excluded dates)
  const isDateAvailable = (date) => {
    if (!excludedDates.length) return true;

    return !excludedDates.some((excludedDate) => isSameDay(date, excludedDate));
  };

  // Function to check if a date is in blocked dates
  const isDateBlocked = (date) => {
    if (!blockedDates.length) return false;

    return blockedDates.some((blockedDate) => isSameDay(date, blockedDate));
  };

  // Function to check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
  };

  // Apply custom styling to calendar days
  const dayClassName = (date) => {
    // Check if date is in the past
    if (isPastDate(date)) {
      return "react-datepicker__day--past";
    }

    // Check if date is blocked
    if (isDateBlocked(date)) {
      return "react-datepicker__day--blocked";
    }

    // Check if date is booked
    if (!isDateAvailable(date)) {
      return "react-datepicker__day--booked";
    }

    // If this is the check-in date, apply check-in styling
    if (checkInDate && isSameDay(date, checkInDate)) {
      return "react-datepicker__day--check-in";
    }

    return "react-datepicker__day--available";
  };

  // Combine excluded and blocked dates for datepicker exclusion
  const getExcludedDates = () => {
    // Create a new array with all dates to exclude
    const combinedExcludedDates = [
      ...excludedDates.map((date) => new Date(date)),
      ...blockedDates.map((date) => new Date(date)),
    ];

    return combinedExcludedDates;
  };

  return (
    <div className="date-picker-container">
      <div className="flex flex-wrap gap-3">
        <div className="date-picker-wrapper flex-1 min-w-[120px]">
          <label>Block from</label>
          <DatePicker
            selected={checkInDate}
            onChange={handleCheckInChange}
            selectsStart
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={new Date()}
            excludeDates={getExcludedDates()}
            dayClassName={dayClassName}
            className="date-input"
            placeholderText="Start date"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div className="date-picker-wrapper flex-1 min-w-[120px]">
          <label>Block until</label>
          <DatePicker
            selected={checkOutDate}
            onChange={handleCheckOutChange}
            selectsEnd
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={checkInDate || new Date()}
            excludeDates={getExcludedDates()}
            dayClassName={dayClassName}
            className="date-input"
            placeholderText="End date"
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color blocked"></div>
          <span>Blocked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color past"></div>
          <span>Past</span>
        </div>
        <div className="legend-item">
          <div className="legend-color check-in"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
