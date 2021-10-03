// Copyright Epic Games, Inc. All Rights Reserved.

#include "NeurogameTemplateGameMode.h"
#include "NeurogameTemplateCharacter.h"
#include "UObject/ConstructorHelpers.h"

ANeurogameTemplateGameMode::ANeurogameTemplateGameMode()
{
	// set default pawn class to our Blueprinted character
	static ConstructorHelpers::FClassFinder<APawn> PlayerPawnBPClass(TEXT("/Game/ThirdPersonCPP/Blueprints/ThirdPersonCharacter"));
	if (PlayerPawnBPClass.Class != NULL)
	{
		DefaultPawnClass = PlayerPawnBPClass.Class;
	}
}
