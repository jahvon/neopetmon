// Custom shader pipeline to remove white backgrounds from sprites
class ChromaKeyPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
    constructor(game) {
        super({
            game: game,
            renderer: game.renderer,
            fragShader: `
                precision mediump float;

                uniform sampler2D uMainSampler;
                uniform vec2 uResolution;

                varying vec2 outTexCoord;
                varying float outTintEffect;
                varying vec4 outTint;

                void main() {
                    vec4 texture = texture2D(uMainSampler, outTexCoord);

                    // Check if pixel is close to white
                    float threshold = 0.90;
                    float whiteness = (texture.r + texture.g + texture.b) / 3.0;

                    // If pixel is very white, make it transparent
                    if (whiteness > threshold &&
                        texture.r > threshold &&
                        texture.g > threshold &&
                        texture.b > threshold) {
                        texture.a = 0.0;
                    }

                    // Apply tint
                    vec4 color = texture;
                    if (outTintEffect == 1.0) {
                        color.rgb = mix(color.rgb, outTint.rgb, outTint.a);
                    } else if (outTintEffect == 2.0) {
                        color.rgb = color.rgb * outTint.rgb;
                    }

                    gl_FragColor = color;
                }
            `
        });
    }
}
