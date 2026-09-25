set_project("ConsoleCommandCenter")
set_version("0.1.0")
set_arch("x64")
set_languages("c++23")
add_requires("nlohmann_json")

add_rules("mode.debug", "mode.releasedbg")

includes("native/lib/commonlibsf")

target("ConsoleCommandCenter")
    add_rules("commonlibsf.plugin", {
        name = "command center",
        author = "console",
        description = "OSF UI native example"
    })
    add_files("native/src/**.cpp")
    add_headerfiles("native/include/**.h")
    add_includedirs("native/include")
    set_installdir("mod")
    add_packages("nlohmann_json")
