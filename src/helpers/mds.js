const states = require("../config/states");
const moment = require("moment");

class mdsHelper {
    sourceParser(body) {
        const data = JSON.parse(body.substring(13));
        const brazil = data["brazil"];
        const world = data["world"][data["world"].length - 1];

        return {
            brazil: this.brazilValuesParser(brazil),
            world,
            updated_at: Date.now()
        };
    }
    brazilValuesParser(brazilList) {
        const convertDateToISO8091 = (date, time) => {
            const newDate = moment(`${date} ${time}`, "DD/MM/YYYY HH:mm");
            return newDate.isValid() ? newDate.toISOString() : "";
        };
        // Create a map with all states to take the history
        const stateMap = new Map();
        brazilList.forEach(item => {
            item.values.forEach(itemValue => {
                let history = stateMap.get(itemValue.uid);
                if (!history) stateMap.set(itemValue.uid, (history = []));

                history.push({
                    date: item.date,
                    time: item.time,
                    date_iso: convertDateToISO8091(item.date, item.time),
                    ...this.informationValueParser(itemValue)
                });
            });
        });

        // Get the last item from brazilList array, important to not break the current users
        const { date, time, values } = brazilList[brazilList.length - 1];

        const lastBrazilItem = {
            date,
            time,
            date_iso: convertDateToISO8091(date, time),
            values: []
        };

        lastBrazilItem.values = values.map(value => {
            return {
                uid: value.uid || "",
                state: states[value.uid] || "",
                ...this.informationValueParser(value),
                history: stateMap.get(value.uid)
            };
        });

        return lastBrazilItem;
    }
    informationValueParser(information) {
        return {
            cases: information.cases || 0,
            deaths: information.deaths || 0,
            suspects: information.suspects || 0,
            refuses: information.refuses || 0,
            broadcast: information.broadcast || false,
            comments: information.comments || ""
        };
    }
}

module.exports = new mdsHelper();