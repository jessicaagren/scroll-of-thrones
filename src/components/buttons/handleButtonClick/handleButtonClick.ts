import { article } from "../../../constants/constants";
import { clearAndAddClickedClass, clearArticle, clearAsideAndAddBackground, playSound } from "../../../helpers/helpers";
import { soundOn } from "../soundButton/soundButton";

const handleButtonClick = (
    elementId: string, 
    buttonId: string, 
    backgroundUrl: string, 
    callback?: () => void, 
    audio?: HTMLAudioElement
) => {
    const element = document.getElementById(elementId);
    const button = document.getElementById(buttonId) as HTMLButtonElement;

    if (element && article) {
        element.addEventListener("click", async () => {
            try {
                if (audio) {
                    playSound(soundOn, audio);
                }

                clearAndAddClickedClass(button);
                clearAsideAndAddBackground(backgroundUrl);
                clearArticle();

                if(callback) {
                    callback();
                }
                    
            } catch (error) {
                console.error(`Fel vid hantering av ${elementId}:`, error);
            }
        });
    } else {
        console.error(`Element med ID '${elementId}' eller 'article' hittades inte.`);
    }
};

export default handleButtonClick;