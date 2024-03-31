const toBase64 = file => {
    return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
};

const randomId = () => {
    let result = 'auto_';
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 27; i++) {
        result += char.charAt(Math.floor(Math.random() * char.length));
    };
    return result;
};

const toRealDate = date => {
	date = date.toString();
	let time = date.slice(16, 24);
	let day = date.slice(8, 10);
	let year = date.slice(11, 15);
	let month = date.slice(4, 7);
	switch (month) {
		case "Jan":
			month = "Januar";
			break;
		case "Feb":
			month = "Februar";
			break;
		case "Mar":
			month = "März";
			break;
		case "Apr":
			month = "April";
			break;
		case "May":
			month = "Mai";
			break;
		case "Jun":
			month = "Juni";
			break;
		case "Jul":
			month = "Juli";
			break;
		case "Aug":
			month = "August";
			break;
		case "Sep":
			month = "September";
			break;
		case "Oct":
			month = "Oktober";
			break;
		case "Nov":
			month = "November";
			break;
		case "Dec":
			month = "Dezember";
			break;
	};
	return `${day}. ${month} ${year} um ${time}`;
};