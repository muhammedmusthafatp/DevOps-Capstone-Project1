async function getMessage() {

    try {

        const response = await fetch("/api");

        const data = await response.json();

        document.getElementById("result").innerHTML =
            data.message;

    }

    catch (error) {

        document.getElementById("result").innerHTML =
            "Backend connection failed.";

    }

}