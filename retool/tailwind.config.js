/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: "tw-",
    content: ["./src/**/*.{css,html,js,ts}"],
    theme: {
        extend: {
            borderRadius: {
                rt: "10px",
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
};
