#include "ofMain.h"
#include "ofApp.h"

int main() {
    ofSetupOpenGL(720, 420, OF_WINDOW);
    ofRunApp(std::make_shared<ofApp>());
    return 0;
}
