export const MOCK_TEST_FULL = {
    id: "test-1",
    title: "PTE Academic Full Mock Test #1",
    sections: [
        {
            name: "Speaking & Writing",
            duration: 54 * 60, // 54 mins
            questions: [
                {
                    id: "sw-1",
                    type: "read_aloud",
                    title: "Read Aloud: Environmental Impact",
                    promptText: "The impact of climate change on biodiversity is a significant concern for scientists worldwide. As temperatures rise, many species are forced to migrate to cooler regions, while others face the risk of extinction due to habitat loss."
                },
                {
                    id: "sw-2",
                    type: "summarize_written_text",
                    title: "Summarize Written Text: Digital Revolution",
                    promptText: "The digital revolution has fundamentally altered how we communicate, work, and interact with the world around us. From the advent of the internet to the rise of smartphones, technology has bridged geographical gaps and democratized information access. However, this shift has also introduced challenges such as data privacy concerns and the digital divide between different socioeconomic groups."
                }
            ]
        },
        {
            name: "Reading",
            duration: 30 * 60, // 30 mins
            questions: [
                {
                    id: "r-1",
                    type: "multiple_choice_single",
                    title: "MCQ Single: Global Economy",
                    promptText: "Which of the following best describes the current trend in the global economy according to the text? The global economy is experiencing a shift towards sustainable energy sources, driven by both policy changes and technological advancements. This transition is expected to create new markets and job opportunities in the green sector.",
                    options: [
                        { id: "a", text: "Stagnation due to lack of innovation" },
                        { id: "b", text: "A shift towards sustainable energy" },
                        { id: "c", text: "Total dependence on fossil fuels" },
                        { id: "d", text: "Decline in green sector jobs" }
                    ]
                }
            ]
        },
        {
            name: "Listening",
            duration: 40 * 60, // 40 mins
            questions: [
                {
                    id: "l-1",
                    type: "summarize_spoken_text",
                    title: "Summarize Spoken Text: Future of AI",
                    promptText: "AI is expected to revolutionize various industries, from healthcare to finance. It will enhance efficiency and provide personalized experiences for users.",
                    promptMediaUrl: "https://example.com/audio/ai-future.mp3"
                }
            ]
        }
    ]
};
