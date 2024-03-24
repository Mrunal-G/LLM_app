import { useState } from 'react'

// import {
//     FewShotPromptTemplate, 
//     LengthBasedExampleSelector,
//     PromptTemplate
// } from "@langchain/core/prompts";


// https://js.langchain.com/docs/modules/model_io/prompts/example_selector_types/length_based
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { LengthBasedExampleSelector } from "@langchain/core/example_selectors";

import { LLMChain } from "langchain/chains";

// import { OpenAI } from "langchain/llms/openai";
import { OpenAI } from "@langchain/openai";

// [WARNING]: Importing from "langchain/llms/openai" is deprecated.
// Instead, please add the "@langchain/openai" package to your project with e.g.
//     $ npm install @langchain/openai



// import { HuggingFaceInference } from "langchain/llms/hf";
import { HuggingFaceInference } from "@langchain/community/llms/hf";

// [WARNING]: Importing from "langchain/llms/hf" is deprecated.
// Instead, please add the "@langchain/community" package to your project with e.g.
//     $ npm install @langchain/community
// and import from "@langchain/community/llms/hf".
// This will be mandatory after the next "langchain" minor version bump to 0.2.





// [WARNING]: Importing from "langchain/prompts" is deprecated.
// Instead, please import from "@langchain/core/prompts".
// This will be mandatory after the next "langchain" minor version bump to 0.2.


//import { ChatMistralAI } from "@langchain/mistralai"; 
// import { ChatFireworks } from "@langchain/community/chat_models/fireworks";



// ======
// npm install @huggingface/inference@2
//import { HuggingFaceInference } from "langchain/llms/hf";
// https://js.langchain.com/docs/integrations/llms/huggingface_inference

// ===

import React from 'react'

const model = new OpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.8,
});



// const model = new HuggingFaceInference({
//     model: "mistralai/Mixtral-8x7B-Instruct-v0.1", 
//     apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY, // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY

//   });

  //I live at 123 Main St, Anytown, USA, my social security number is 123-45-6789, and my driver's license number is D1234567.
  // google/gemma-7b
  // mistralai/Mixtral-8x7B-Instruct-v0.1
  // HuggingFaceM4/idefics-9b-instruct
  //tiiuae/falcon-7b-instruct
  
  // "mistralai/Mistral-7B-v0.1", 
  // google/flan-t5-xxl


// const model = new ChatMistralAI({
//     modelName: "mistral-large-latest",
//     temperature: 0,
//   });


const exampleTemplate = `User: {query}
AI: {answer}`;


const examplePrompt = new PromptTemplate({
    template: exampleTemplate,
    inputVariables: ["query", "answer"],
});


const examples = [
    {
        query: "My name is John Doe and my email is johndoe@example.com. My cookie ID is CI12345 and my username is johndoe.",
        answer: 
        "My name is John Doe [Name] and my email is johndoe@example.com [Email]. My cookie ID is CI12345 [InternetActivity] and my username is johndoe [InternetActivity]."

    },

    {
        query: "My home address is 123 Main St, Anytown, USA, and my phone number is 555-123-4567 My employee ID number is E12345 and my work email is johndoe@company.com.",
        answer: 
        "My home address is 123 Main St, Anytown, USA [Address], and my phone number is 555-123-4567 [Phone] My employee ID number is E12345 [Employment] and my work email is johndoe@company.com [Employment].",

    },
];

const exampleSelector = new LengthBasedExampleSelector({
    examples: examples,
    examplePrompt: examplePrompt,
    maxLength: 50,

})

const dynamicPromptTemplate = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: prompt,
    prefix: `The following are excerpts from conversations with an AI
    assistant. Rewrite the text by identifying the entities and writing the entity type (the one-word PII) from the following 15 entity types described beloe beside the entities in square brackets within original text.

    [Name] - The complete name of an individual.
    [Address] - The residential address of an individual.
    [Email] - Personal email addresses.
    [SSN] - A unique number assigned to individuals in the the United States for identification purposes.
    [Passport] - A unique number assigned to a passport document.
    [License] - A unique number assigned to a driver's license.
    [CreditCard] - Numbers associated with personal credit cards.
    [Birthdate] - The birth date of an individual.
    [Phone] - Personal landline or mobile phone numbers.
    [MedicalRecord] - Unique identifiers for personal medical records.
    [Biometric] - Fingerprints, facial recognition patterns, DNA, etc.
    [Vehicle] - License plate numbers, VIN Vehicle Identification Number, etc.
    [InternetActivity] - IP addresses, cookie IDs, device identifiers, etc.
    [Employment] - Employee ID number, work email, work phone number, etc.
    [Education] - Student ID number, transcripts, etc.
    
    **Example:** My IP address is 192.0.2.0 [InternetActivity], my device identifier is DI12345 [InternetActivity], and my cookie ID is CI12345 [InternetActivity].

    Here are some 
    examples: \n`,
    suffix: "\nUser: {query}\nAnswer: ",
    inputVariables: ["query"],
    exampleSeparator: "\n\n",

});

const chain = new LLMChain({llm: model, prompt: dynamicPromptTemplate });

function Example() {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const response = await chain.call({
            query: query
        });
        setIsLoading(false);
        setAnswer(response.text);
    };



    return (
        <div className="max-w-md mx-auto mt-8 bg-gray-100 p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">PII Detection with LLM</h1>
            <form onSubmit={handleSubmit} className="flex">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Enter your question"
                    className="mr-2 p-2 rounded border border-gray-300 focus:outline-none focus:border-purple-500 flex-grow"
                 
                />
                <button
                    type="submit"
                    disabled={!query || isLoading}
                
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    style={{margin: "5px",  width: '9rem', height: '3rem' }}

                >
                    {isLoading ? "Loading..." : "Submit"}
                </button>
            </form>
            {answer && (
                <div className="mt-4">
                    <b>Answer: </b>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}

export default Example;



   
