'use client';

import { useState, useEffect, useMemo } from 'react';
import { Event, User, EventType } from '@/types';
import EventModal from './EventModal';

interface CalendarProps {
  year: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Calendar({ year }: CalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchEventTypes();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const response = await fetch('/api/event-types');
      const data = await response.json();
      setEventTypes(data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getLastDayOfPreviousMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getMonthDays = useMemo(() => {
    const monthDaysMap: { [key: number]: { day: number; date: Date; isCurrentMonth: boolean }[] } = {};
    
    for (let month = 0; month < 12; month++) {
      const monthDays: { day: number; date: Date; isCurrentMonth: boolean }[] = [];
      const firstDay = getFirstDayOfMonth(year, month);
      const daysInMonth = getDaysInMonth(year, month);
      const lastDayPrevMonth = getLastDayOfPreviousMonth(year, month);

      // Add trailing days from previous month
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = lastDayPrevMonth - i;
        monthDays.push({
          day,
          date: new Date(year, month - 1, day),
          isCurrentMonth: false,
        });
      }

      // Add current month days
      for (let day = 1; day <= daysInMonth; day++) {
        monthDays.push({
          day,
          date: new Date(year, month, day),
          isCurrentMonth: true,
        });
      }

      // Don't add days from next month - each month row ends on its last day

      monthDaysMap[month] = monthDays;
    }

    return monthDaysMap;
  }, [year]);

  // Calculate total columns and generate repeating weekly pattern for headers
  const weekdayHeaders = useMemo(() => {
    const monthDaysArray = Object.values(getMonthDays) as { day: number; date: Date; isCurrentMonth: boolean }[][];
    const totalColumns = monthDaysArray.reduce((sum: number, days: { day: number; date: Date; isCurrentMonth: boolean }[]) => sum + days.length, 0);
    const headers: { dayOfWeek: number; label: string; isSunday: boolean; isSaturday: boolean }[] = [];
    
    for (let i = 0; i < totalColumns; i++) {
      const dayOfWeek = i % 7;
      headers.push({
        dayOfWeek,
        label: DAYS[dayOfWeek],
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
      });
    }
    
    return headers;
  }, [getMonthDays]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const checkDate = new Date(date);
      
      // Reset time to compare dates only
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate >= start && checkDate <= end;
    });
  };

  const handleDateClick = (date: Date) => {
    if (!isSelecting) {
      setSelectedRange({ start: date, end: date });
      setIsSelecting(true);
    } else {
      if (selectedRange.start) {
        const start = selectedRange.start < date ? selectedRange.start : date;
        const end = selectedRange.start < date ? date : selectedRange.start;
        setSelectedRange({ start, end });
        setIsModalOpen(true);
        setIsSelecting(false);
      }
    }
  };

  const handleDateMouseEnter = (date: Date) => {
    if (isSelecting && selectedRange.start) {
      const start = selectedRange.start < date ? selectedRange.start : date;
      const end = selectedRange.start < date ? date : selectedRange.start;
      setSelectedRange({ start, end });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRange({ start: null, end: null });
    setIsSelecting(false);
  };

  const handleEventCreated = () => {
    fetchEvents();
    handleModalClose();
  };

  const getEventPosition = (event: Event, monthDays: { day: number; date: Date; isCurrentMonth: boolean }[]) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    let startIndex = -1;
    let endIndex = -1;
    let span = 0;

    monthDays.forEach((day, index) => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      const eventStart = new Date(start);
      eventStart.setHours(0, 0, 0, 0);
      const eventEnd = new Date(end);
      eventEnd.setHours(0, 0, 0, 0);

      if (dayDate.getTime() === eventStart.getTime() && startIndex === -1) {
        startIndex = index;
      }
      if (dayDate.getTime() === eventEnd.getTime()) {
        endIndex = index;
      }
    });

    if (startIndex !== -1 && endIndex !== -1) {
      span = endIndex - startIndex + 1;
    }

    return { startIndex, span };
  };

  return (
    <div className="w-full">
      <div className="inline-block min-w-0">
        {/* Year Header */}
        <div className="mb-4">
          <h1 className="text-4xl font-bold mb-2">CALENDAR</h1>
          <div className="text-5xl font-bold">{year}</div>
        </div>

        {/* Weekday Headers */}
        <div className="flex mb-2">
          <div className="w-32 flex-shrink-0"></div> {/* Month column spacer */}
          <div className="flex">
            {weekdayHeaders.map((header, index) => (
              <div
                key={index}
                className={`w-8 flex-shrink-0 text-center text-xs font-semibold ${
                  header.isSunday ? 'text-red-600' : header.isSaturday ? 'text-red-600' : 'text-black'
                }`}
              >
                {header.label}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-gray-300">
          {MONTHS.map((monthName, monthIndex) => {
            const monthDays = getMonthDays[monthIndex] || [];
            const monthEvents = events.filter(event => {
              const eventStart = new Date(event.startDate);
              const eventEnd = new Date(event.endDate);
              return (eventStart.getFullYear() === year && eventStart.getMonth() === monthIndex) ||
                     (eventEnd.getFullYear() === year && eventEnd.getMonth() === monthIndex) ||
                     (eventStart.getFullYear() === year && eventStart.getMonth() < monthIndex && eventEnd.getMonth() >= monthIndex);
            });

            return (
              <div
                key={monthIndex}
                className={`flex border-b border-gray-300 ${
                  monthIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                }`}
              >
                {/* Month Label */}
                <div className="w-32 p-2 font-semibold border-r border-gray-300 flex items-center">
                  {monthName}
                </div>

                {/* Days Row */}
                <div className="flex relative">
                  {monthDays.map((day, dayIndex) => {
                    const dayOfWeek = day.date.getDay();
                    const isSunday = dayOfWeek === 0;
                    const isSaturday = dayOfWeek === 6;
                    const isSelected = selectedRange.start && selectedRange.end &&
                      day.date >= selectedRange.start && day.date <= selectedRange.end;
                    const dayEvents = getEventsForDate(day.date);

                    return (
                      <div
                        key={dayIndex}
                        className={`w-8 flex-shrink-0 h-16 border-r border-gray-200 flex flex-col items-center justify-start p-1 cursor-pointer hover:bg-blue-50 ${
                          isSelected ? 'bg-blue-100' : ''
                        } ${!day.isCurrentMonth ? 'text-gray-400' : ''} ${
                          isSunday || isSaturday ? 'bg-red-50' : ''
                        }`}
                        onClick={() => handleDateClick(day.date)}
                        onMouseEnter={() => handleDateMouseEnter(day.date)}
                      >
                        <span
                          className={`text-xs ${
                            isSunday || isSaturday ? 'text-red-600 font-semibold' : 'text-black'
                          }`}
                        >
                          {day.isCurrentMonth ? day.day : ''}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="w-full mt-1 space-y-0.5">
                            {dayEvents.map((event) => {
                              const eventType = eventTypes.find(et => et.id === event.eventTypeId);
                              const { startIndex, span } = getEventPosition(event, monthDays);
                              const isFirstDay = dayIndex === startIndex;
                              
                              if (!isFirstDay) return null;

                              return (
                                <div
                                  key={event.id}
                                  className="text-[8px] px-1 py-0.5 rounded text-white truncate"
                                  style={{
                                    backgroundColor: eventType?.colorHexCode || '#gray',
                                    width: `${span * 32 - 2}px`,
                                  }}
                                  title={`${event.title} - ${event.user.name}`}
                                >
                                  <div className="truncate font-semibold">{event.title}</div>
                                  <div className="truncate text-[7px] opacity-90">{event.user.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && selectedRange.start && selectedRange.end && (
        <EventModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          startDate={selectedRange.start}
          endDate={selectedRange.end}
          users={users}
          eventTypes={eventTypes}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}

