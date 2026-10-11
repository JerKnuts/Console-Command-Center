set_project("ConsoleCommandCenter")
set_version("1.2.18")
set_arch("x64")
set_languages("c++23")
add_requires("nlohmann_json")
add_requires("zlib 1.3.2", {configs = {shared = false}})

add_rules("mode.debug", "mode.releasedbg")

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
