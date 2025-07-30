import dayjs from "dayjs"
import duration from "dayjs/plugin/duration.js"
import isBetween from "dayjs/plugin/isBetween.js"
import isLeapYear from "dayjs/plugin/isLeapYear.js"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js"
import isToday from "dayjs/plugin/isToday.js"
import isTomorrow from "dayjs/plugin/isTomorrow.js"
import isYesterday from "dayjs/plugin/isYesterday.js"
import minMax from "dayjs/plugin/minMax.js"
import objectSupport from "dayjs/plugin/objectSupport.js"
import quarterOfYear from "dayjs/plugin/quarterOfYear.js"
import toObject from "dayjs/plugin/toObject.js"
import utc from "dayjs/plugin/utc.js"

export function configureDayJs() {
    dayjs.extend(duration)
    dayjs.extend(isBetween)
    dayjs.extend(isLeapYear)
    dayjs.extend(isSameOrAfter)
    dayjs.extend(isSameOrBefore)
    dayjs.extend(isToday)
    dayjs.extend(isTomorrow)
    dayjs.extend(isYesterday)
    dayjs.extend(minMax)
    dayjs.extend(objectSupport)
    dayjs.extend(quarterOfYear)
    dayjs.extend(toObject)
    dayjs.extend(utc)
}