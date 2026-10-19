#include "CommandBatches.h"
#include <chrono>
#include <iostream>

namespace fs = std::filesystem;
void Check(bool value, const char* reason) { if (!value) throw std::runtime_error(reason); }
std::size_t BatchCount(const fs::path& directory) {
    std::size_t count = 0;
    for (const auto& entry : fs::directory_iterator(directory)) if (entry.path().extension() == L".txt") ++count;
    return count;
}
int main() {
    try {
        const auto directory = fs::temp_directory_path() / (L"ccc-sample-test-" + std::to_wstring(GetCurrentProcessId()) + L"-" + std::to_wstring(GetTickCount64()));
        fs::create_directories(directory);
        std::vector<std::string> warnings;
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(warnings.empty() && BatchCount(directory) == 3, "Empty folder did not receive exactly three samples.");
        const auto supplies = directory / L"Sample - Basic Supplies.txt";
        const auto materials = directory / L"Sample - Workshop Materials.txt";
        const auto starter = directory / L"Sample - Ballistic Starter Kit.txt";
        Check(CCC::CommandBatches::Commands(CCC::CommandBatches::ReadFile(supplies)).size() == 4, "Supply sample command count is incorrect.");
        Check(CCC::CommandBatches::Commands(CCC::CommandBatches::ReadFile(materials)).size() == 5, "Material sample command count is incorrect.");
        Check(CCC::CommandBatches::Commands(CCC::CommandBatches::ReadFile(starter)).size() == 2, "Starter sample command count is incorrect.");
        CCC::CommandBatches::WriteFile(supplies, "# My edited file\ntgm\n");
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(CCC::CommandBatches::ReadFile(supplies) == "# My edited file\ntgm\n", "User edits were overwritten.");
        fs::remove(supplies);
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(!fs::exists(supplies), "Deleted sample was recreated.");
        fs::remove(materials); fs::remove(starter);
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(BatchCount(directory) == 0, "Samples returned after all batches were deleted.");
        const auto existing = directory / L"Existing";
        fs::create_directories(existing);
        CCC::CommandBatches::WriteFile(existing / L"My Batch.txt", "tcl\n");
        CCC::CommandBatches::InstallSampleBatches(existing, warnings);
        Check(BatchCount(existing) == 1 && CCC::CommandBatches::ReadFile(existing / L"My Batch.txt") == "tcl\n", "Existing user folder was changed.");
        const auto parsed = CCC::CommandBatches::Commands("# Heading\n; Legacy comment\nplayer.additem 0000ABF9 10 ; note\ngetgs \"literal;#\" # tail\n");
        Check(parsed == std::vector<std::string>{"player.additem 0000ABF9 10", "getgs \"literal;#\""}, "Quoted comment markers or inline comments parsed incorrectly.");
        const auto included = directory / L"Included";
        const OSFUI::API::Json defaults = OSFUI::API::Json::array({{{"name", "First"}, {"commands", "getgs fJumpHeightMin\n"}}, {{"name", "Second"}, {"commands", "getgs fHandScannerScanRange\n"}}});
        CCC::CommandBatches::SeedIncluded(included, defaults);
        Check(BatchCount(included) == 2, "Included defaults were not created.");
        CCC::CommandBatches::WriteFile(included / L"First.txt", "# Edited\ngetgs fJumpHeightMin\n");
        fs::remove(included / L"Second.txt");
        CCC::CommandBatches::SeedIncluded(included, defaults);
        Check(CCC::CommandBatches::ReadFile(included / L"First.txt").starts_with("# Edited"), "Included file edit overwritten.");
        Check(!fs::exists(included / L"Second.txt"), "Deleted included file recreated.");
        auto extended = defaults;
        extended.push_back({{"name", "Third"}, {"commands", "getgs iHandScannerPlantsCountBase\n"}});
        CCC::CommandBatches::SeedIncluded(included, extended);
        Check(BatchCount(included) == 2 && fs::exists(included / L"Third.txt"), "New included defaults were not added independently.");
        const OSFUI::API::Json renamed = OSFUI::API::Json::array({
            {{"name", "First RESET"}, {"previousName", "First"}, {"commands", "tgm\n"}},
            {{"name", "Second RESET"}, {"previousName", "Second"}, {"commands", "tgm\n"}}
        });
        CCC::CommandBatches::SeedIncluded(included, renamed);
        Check(!fs::exists(included / L"First.txt") && CCC::CommandBatches::ReadFile(included / L"First RESET.txt").starts_with("# Edited"), "Rename lost an edit or kept the old filename.");
        Check(!fs::exists(included / L"Second RESET.txt"), "Rename recreated a deleted default.");
        fs::remove(included / L"First RESET.txt");
        CCC::CommandBatches::SeedIncluded(included, renamed);
        Check(!fs::exists(included / L"First RESET.txt"), "Repeated rename recreated a deleted file.");
        CCC::CommandBatches::WriteFile(included / L"Old.txt", "tcl\n");
        CCC::CommandBatches::WriteFile(included / L"New RESET.txt", "tfc\n");
        CCC::CommandBatches::SeedIncluded(included, OSFUI::API::Json::array({{{"name", "New RESET"}, {"previousName", "Old"}, {"commands", "tgm\n"}}}));
        Check(CCC::CommandBatches::ReadFile(included / L"Old.txt") == "tcl\n" && CCC::CommandBatches::ReadFile(included / L"New RESET.txt") == "tfc\n", "Rename collision overwrote user contents.");
        std::cout << "Sample batch checks passed: first use, contents, edits, deletion, existing folders, rename migration, repeat migration and destination collisions.\nFixtures retained in " << directory.string() << '\n';
        return 0;
    } catch (const std::exception& error) { std::cerr << error.what() << '\n'; return 1; }
}
