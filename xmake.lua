set_project("ConsoleCommandCenter")
set_version("1.3.0")
set_arch("x64")
set_languages("c++23")
add_requires("nlohmann_json")
add_requires("zlib 1.3.2", {configs = {shared = false}})

add_rules("mode.debug", "mode.releasedbg")

target("PreviewGeometryTests")
    set_kind("binary")
    set_default(false)
    add_files("tests/native-preview.cpp")
    add_includedirs("native/include")
    add_packages("zlib")

target("PreviewTriggerTests")
    set_kind("binary")
    set_default(false)
    add_files("tests/native-preview-triggers.cpp")
    add_includedirs("native/include", "native/lib/commonlibsf/lib/commonlib-shared/include")
    add_packages("nlohmann_json")

includes("native/lib/commonlibsf")

target("ConsoleCommandCenter")
    add_rules("commonlibsf.plugin", {
        name = "Console Command Center",
        author = "JerKnuts",
        description = "In-game Starfield console command controller"
    })
    add_files("native/src/**.cpp")
    add_headerfiles("native/include/**.h")
    add_includedirs("native/include")
    set_installdir("mod")
    add_packages("nlohmann_json", "zlib")
    add_syslinks("shell32", "ole32")

target("QuestStagesTests")
    set_kind("binary")
    set_default(false)
    add_files("tests/native-quest-stages.cpp")
    add_includedirs("native/include")
    add_packages("zlib")

target("ScalarResultTests")
    set_kind("binary")
    set_default(false)
    add_files("tests/native-scalar-result.cpp")
    add_includedirs("native/include")

target("SampleBatchTests")
    set_kind("binary")
    set_default(false)
    add_files("tests/native-sample-batches.cpp")
    add_includedirs("native/include", "native/lib/commonlibsf/lib/commonlib-shared/include")
    add_packages("nlohmann_json")
    add_syslinks("shell32", "ole32")

target("DevFeedbackTests")
    set_kind("binary")
    set_default(false)
    add_files("tests/native-dev-feedback.cpp")
    add_includedirs("native/include", "native/lib/commonlibsf/lib/commonlib-shared/include")
    add_packages("nlohmann_json")
    add_syslinks("shell32", "ole32")
